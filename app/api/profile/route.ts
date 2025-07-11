import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/database/mongodb";
import { Db, ObjectId } from "mongodb";
import { UserSession } from "@/lib/providers/AuthProvider"; // Import UserSession from shared types
import { User } from "@/models/userSchema"; // IMPORTANT: Import User type from your schema file

// Ensure JWT_SECRET is set in your environment variables for production
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Handles GET requests to retrieve the authenticated user's profile data.
 * This route is protected and requires a valid JWT token in the cookies.
 * The user's identity is solely derived from the token for security.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Server Configuration Check: Ensure JWT_SECRET is defined
    if (!JWT_SECRET) {
      console.error("[Profile API GET] Server configuration error: JWT_SECRET is not defined.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // 2. Get token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      console.warn("[Profile API GET] Attempt to access profile without token.");
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // 3. Verify JWT token and extract user ID
    let decodedToken: UserSession;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as UserSession;
      // Basic validation for decoded token structure
      if (!decodedToken.userId) {
        throw new Error("Invalid token payload: userId missing.");
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      const errorMessage = error instanceof Error ? error.message : "Unknown JWT error";
      console.error("[Profile API GET] JWT verification failed:", errorMessage);

      const response = NextResponse.json({ error: "Invalid or expired session. Please sign in again." }, { status: 401 });
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

    const userIdFromToken = decodedToken.userId;

    // 4. Connect to MongoDB and fetch user details
    const client = await clientPromise;
    const db: Db = client.db("auth"); // Assuming your database name is "auth"
    // FIX: Use the imported 'User' type for the collection
    const usersCollection = db.collection<User>("users");

    // FIX: Use the imported 'User' type for the user variable
    let user: User | null = null;
    try {
      // Convert userIdFromToken string back to ObjectId for MongoDB query
      const objectId = new ObjectId(userIdFromToken);
      user = await usersCollection.findOne({ _id: objectId });
    } catch (error: unknown) { // Use 'unknown' for database errors
      const errorMessage = error instanceof Error ? error.message : "Unknown database error";
      console.error("[Profile API GET] Database query error:", errorMessage);
      return NextResponse.json({ error: "Failed to retrieve user data due to database issue." }, { status: 500 });
    }

    // 5. Check if user exists in the database
    if (!user) {
      console.warn(`[Profile API GET] User with ID ${userIdFromToken} not found in database.`);
      const response = NextResponse.json({ error: "User profile not found. Account may have been deleted or corrupted." }, { status: 404 });
      // Clear the cookie if user no longer exists in DB
      response.cookies.set("token", "", {
        path: "/",
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return response;
    }

    // 6. Return sanitized user profile data
    // Exclude sensitive fields like password, OTP, etc.
    const profileData = {
      name: user.name || null, // Ensure name is string | null
      email: user.email,
      role: user.role || "user",
      emailVerified: user.emailVerified,
      // Convert Date objects from MongoDB to ISO strings for consistent JSON
      // Use optional chaining and nullish coalescing for nullable Date properties
      createdAt: user.createdAt?.toISOString() || null,
      lastLogin: user.lastLogin?.toISOString() || null,
      // Add any other non-sensitive profile fields you want to expose from your user document
    };

    console.log(`[Profile API GET] Profile data retrieved for user ID: ${userIdFromToken}`);
    return NextResponse.json({ profile: profileData }, { status: 200 });

  } catch (error: unknown) { // Catch any unexpected server errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[Profile API GET] Unexpected server error:", errorMessage);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
