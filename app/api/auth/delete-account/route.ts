import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/database/mongodb";
import { Db, ObjectId } from "mongodb";
import { UserSession } from "@/lib/providers/AuthProvider"; // IMPORTANT: Import UserSession from the shared types/auth.ts file

// Ensure JWT_SECRET is set in your environment variables for production
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Handles DELETE requests to delete an authenticated user's account.
 * This route is protected and requires a valid JWT token in the cookies.
 * The user ID for deletion is strictly derived from the verified JWT token,
 * not from the request body, for security.
 */
export async function DELETE(req: NextRequest) {
  try {
    // 1. Server Configuration Check: Ensure JWT_SECRET is defined
    if (!JWT_SECRET) {
      console.error("[Delete Account API] Server configuration error: JWT_SECRET is not defined.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // 2. Get token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      console.warn("[Delete Account API] Attempt to delete account without token.");
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // 3. Verify JWT token and extract user ID
    let decodedToken: UserSession;
    try {
      // Use the imported UserSession interface for type assertion
      decodedToken = jwt.verify(token, JWT_SECRET) as UserSession;
      // Basic validation for decoded token structure
      if (!decodedToken.userId) {
        throw new Error("Invalid token payload: userId missing.");
      }
    } catch (error: unknown) { // Use 'unknown' for caught errors
      const errorMessage = error instanceof Error ? error.message : "Unknown JWT error";
      console.error("[Delete Account API] JWT verification failed:", errorMessage);

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

    // The userId for deletion is the one from the verified token
    const userIdToDelete = decodedToken.userId;

    // 4. Connect to MongoDB
    const client = await clientPromise;
    const db: Db = client.db("auth"); // Assuming your database name is "auth"
    const usersCollection = db.collection("users"); // Assuming your collection name is "users"

    // 5. Delete the user document
    let deletionResult;
    try {
      const objectIdToDelete = new ObjectId(userIdToDelete);
      deletionResult = await usersCollection.deleteOne({ _id: objectIdToDelete });
    } catch (error: unknown) { // Use 'unknown' for database errors
      const errorMessage = error instanceof Error ? error.message : "Unknown database error";
      console.error("[Delete Account API] Database deletion error:", errorMessage);
      return NextResponse.json({ error: "Failed to delete account due to a database issue." }, { status: 500 });
    }

    // 6. Handle deletion result
    if (deletionResult.deletedCount === 0) {
      console.warn(`[Delete Account API] User with ID ${userIdToDelete} not found for deletion (already deleted or invalid ID).`);
      const response = NextResponse.json({ error: "Account not found or already deleted." }, { status: 404 });
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

    // 7. Account successfully deleted. Clear the authentication cookie.
    const response = NextResponse.json({ message: "Account deleted successfully." }, { status: 200 });
    response.cookies.set("token", "", {
      path: "/",
      expires: new Date(0), // Expire the cookie immediately
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log(`[Delete Account API] Account for user ID ${userIdToDelete} deleted successfully.`);
    return response;
  } catch (error: unknown) {
    // Catch any unexpected server errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[Delete Account API] Unexpected server error:", errorMessage);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
