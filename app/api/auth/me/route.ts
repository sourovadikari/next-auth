import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/database/mongodb";
import { Db, ObjectId } from "mongodb"; // Import ObjectId for _id type
import { UserSession, UserData } from "@/lib/providers/AuthProvider"; // Assuming UserData is defined in AuthProvider

// --- Type Definitions (Moved to a shared types/db.ts or types/user.ts if not already there) ---
// Define the structure of the user document as stored in MongoDB
// This interface should accurately reflect your MongoDB user collection's document structure.
interface UserDocument {
  _id: ObjectId;
  email: string;
  name?: string | null;
  role?: string;
  password?: string; // Optional, as it might not always be present (e.g., OAuth users)
  emailVerified: boolean;
  otp?: string | null;
  otpExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  // Add any other fields that are part of your user document in MongoDB
}
// --- End Type Definitions ---

// Ensure JWT_SECRET is set in your environment variables for production
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Handles GET requests to retrieve the authenticated user's session data.
 * This route is protected and requires a valid JWT token in the cookies.
 * It verifies the token and fetches the latest user data from the database.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Server Configuration Check: Ensure JWT_SECRET is defined
    if (!JWT_SECRET) {
      console.error("[Auth API /me] Server configuration error: JWT_SECRET is not defined.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // 2. Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      console.log("[Auth API /me] No authentication token found. User is not logged in.");
      // Return 200 OK with null user if no token, indicating no active session, not an error.
      return NextResponse.json({ user: null, message: "No active session." }, { status: 200 });
    }

    // 3. Verify JWT token
    let decodedToken: UserSession;
    try {
      // Use the shared UserSession interface for the decoded token
      decodedToken = jwt.verify(token, JWT_SECRET) as UserSession;

      // Basic validation for essential fields in the decoded token
      if (!decodedToken.userId || !decodedToken.email) {
        throw new Error("Invalid token payload: userId or email missing.");
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      const errorMessage = error instanceof Error ? error.message : "Unknown JWT error";
      console.error("[Auth API /me] JWT verification failed:", errorMessage);

      const response = NextResponse.json({ user: null, message: "Invalid or expired session. Please sign in again." }, { status: 401 });
      // Clear invalid token from cookie for security
      response.cookies.set("token", "", {
        path: "/",
        expires: new Date(0), // Expire the cookie immediately
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return response;
    }

    // 4. Connect to DB and fetch user details using _id from token (more robust)
    const client = await clientPromise;
    const db: Db = client.db("auth"); // Assuming your database name is "auth"
    // FIX: Explicitly type the collection with UserDocument interface
    const usersCollection = db.collection<UserDocument>("users"); // Specify UserDocument type for the collection

    // FIX: Replace 'any' with the specific 'UserDocument' type
    let userFromDb: UserDocument | null = null;
    try {
      // CRITICAL: Use userId from the decoded token to find the user in the database.
      // This is more secure and reliable than relying solely on email, as _id is immutable.
      const objectId = new ObjectId(decodedToken.userId);
      userFromDb = await usersCollection.findOne({ _id: objectId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown database error";
      console.error("[Auth API /me] Database lookup error:", errorMessage);
      return NextResponse.json({ user: null, error: "Failed to retrieve user data." }, { status: 500 });
    }

    // 5. Check if user still exists in the database
    if (!userFromDb) {
      // User might have been deleted from DB or ID changed — clear the cookie for security
      console.warn(`[Auth API /me] User with ID ${decodedToken.userId} from token not found in DB. Clearing cookie.`);
      const response = NextResponse.json({ user: null, message: "User not found or session expired." }, { status: 401 });
      response.cookies.set("token", "", {
        path: "/",
        expires: new Date(0), // Expire immediately
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return response;
    }

    // 6. Return sanitized user data, aligned with UserData interface
    const userData: UserData = {
      id: userFromDb._id.toString(), // Convert ObjectId to string for client
      email: userFromDb.email,
      name: userFromDb.name || null, // Ensure name is string | null
      role: userFromDb.role || "user", // Default role if not explicitly set
      emailVerified: userFromDb.emailVerified || false, // Default to false if not set
    };

    console.log(`[Auth API /me] User session retrieved for: ${userData.email}`);
    return NextResponse.json({ user: userData }, { status: 200 });

  } catch (error: unknown) { // Catch any unexpected server errors
    const errorMessage = error instanceof Error ? error.message : "An internal server error occurred.";
    console.error("[Auth API /me] Unexpected server error:", errorMessage, error);

    const response = NextResponse.json({ user: null, error: "An internal server error occurred." }, { status: 500 });
    // Attempt to clear the token on any server-side error to prevent stale sessions
    response.cookies.set("token", "", {
      path: "/",
      expires: new Date(0), // Expire immediately
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  }
}
