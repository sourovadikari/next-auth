import { NextRequest, NextResponse } from "next/server";

/**
 * Handles POST requests for user sign-out.
 * Clears the authentication JWT token cookie from the client.
 */
// FIX: Added ESLint disable comment to explicitly ignore the '_req' parameter.
// The underscore prefix `_req` is a common convention for unused parameters,
// but some ESLint configurations might still flag it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  try {
    // Create a new NextResponse instance to manipulate cookies
    const response = NextResponse.json({ message: "Signed out successfully." }, { status: 200 });

    // Clear the authentication token cookie
    response.cookies.set("token", "", {
      httpOnly: true, // Prevent client-side JavaScript access to the cookie
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "lax", // Protect against CSRF attacks
      path: "/", // Cookie valid for all paths
      expires: new Date(0), // Set expiry date to a past date to immediately invalidate the cookie
    });

    console.log("[Sign Out API] User signed out successfully (cookie cleared).");
    return response;
  } catch (error: unknown) { // Use 'unknown' for caught errors for better type safety
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[Sign Out API] Server error during sign out:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error during sign out." },
      { status: 500 }
    );
  }
}
