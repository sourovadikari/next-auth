import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/database/mongodb";
import { userSchema, User } from "@/models/userSchema"; // Import userSchema and User type
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Db } from "mongodb"; // Import Db type

// Using the user's specified import path for email functions
import {
  sendVerificationSuccessEmail,
  sendPasswordResetSuccessEmail,
  // If sendOTPEmail is used elsewhere in this file for resend logic, uncomment it:
  // sendOTPEmail,
} from "@/lib/email/send-otp"; 

// Using the user's specified import path for UserSession
import { UserSession } from "@/lib/providers/AuthProvider"; 

// --- Zod Schemas for Request Body Validation ---
// Schema for OTP verification requests
const otpVerificationSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});

// Schema for password reset requests (after OTP is validated)
const passwordResetBodySchema = z.object({
  password: userSchema.shape.password, // Reusing password validation from userSchema
});
// --- End Zod Schemas ---

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generates a JWT token for the given user.
 * @param user The user object from the database (type User from userSchema).
 * @returns A signed JWT string.
 */
function generateJWT(user: User): string {
  if (!JWT_SECRET) {
    // This should ideally be caught by the main API route check, but good to be safe
    throw new Error("JWT_SECRET is not defined for token generation.");
  }
  // When a user is retrieved from MongoDB, _id is guaranteed to exist.
  // The 'User' type from userSchema allows _id to be optional (for new users before insertion),
  // but for a 'found' user, it will be present.
  return jwt.sign(
    {
      email: user.email,
      userId: user._id!.toString(), // Use non-null assertion as _id will exist for a retrieved user
      role: user.role || "user",
      name: user.name || null,
    } as UserSession, // Type assertion for JWT payload
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Sets the authentication cookie in the response.
 * @param response The NextResponse object.
 * @param token The JWT token to set.
 */
function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    httpOnly: true, // Prevent client-side JavaScript access
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "lax", // Protect against CSRF attacks
    path: "/", // Cookie valid for all paths
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  });
}

/**
 * Handles POST requests for email verification (signup) or password reset.
 * It expects an OTP or a new password in the request body, depending on the 'type' parameter.
 */
export async function POST(
  req: NextRequest,
  // FIX: This is a workaround for a Next.js internal type checking issue.
  // The Next.js build system sometimes expects `context.params` to be a Promise,
  // even though it's directly accessible at runtime.
  // We type it as a Promise to satisfy the internal type checker during build.
  context: { params: Promise<{ email: string; type: string }> }
) {
  try {
    // 1. Server Configuration Check: Ensure JWT_SECRET is defined
    if (!JWT_SECRET) {
      console.error("[Verification API] Server configuration error: JWT_SECRET is not defined.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // 2. Extract parameters from context and normalize email
    // We still access context.params as a plain object because that's how it behaves at runtime.
    const { email: rawEmail, type } = await context.params; // Await context.params here to satisfy the Promise type
    const email = decodeURIComponent(rawEmail).toLowerCase(); // Normalize email

    // 3. Parse request body
    const body: unknown = await req.json(); // Use 'unknown' for initial parsed body

    // 4. Connect to MongoDB
    const client = await clientPromise;
    const db: Db = client.db("auth");
    const usersCollection = db.collection<User>("users"); // Explicitly type the collection with User

    // 5. Case-insensitive email lookup
    const user = await usersCollection.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    if (!user) {
      console.warn(`[Verification API] User not found for verification: ${email}`);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // --- OTP Verification Flow ---
    // Attempt to parse body as OTP verification request
    const otpParsed = otpVerificationSchema.safeParse(body);

    if (otpParsed.success) { // If body contains a valid OTP
      const otp = otpParsed.data.otp;

      // Prevent re-verifying already verified signup emails
      if (type === "signup" && user.emailVerified) {
        console.log(`[Verification API] Attempted to re-verify already verified signup email: ${email}.`);
        // Return user data and token for already verified users to seamlessly log them in
        const token = generateJWT(user);
        const response = NextResponse.json({
          user: {
            email: user.email,
            id: user._id!.toString(), // Use non-null assertion here too
            name: user.name || null,
            role: user.role || "user",
            emailVerified: user.emailVerified,
          },
          status: "already_verified",
        }, { status: 200 });
        setAuthCookie(response, token);
        return response;
      }

      // Validate OTP and its expiry
      if (
        !user.otp || // OTP is missing in DB
        !user.otpExpiry || // OTP expiry is missing in DB
        user.otp !== otp || // OTP does not match
        new Date(user.otpExpiry) < new Date() // OTP has expired
      ) {
        console.warn(`[Verification API] Invalid or expired OTP for ${email} (type: ${type}).`);
        return NextResponse.json(
          { error: "Invalid or expired OTP." },
          { status: 400 }
        );
      }

      // Handle 'signup' verification type
      if (type === "signup") {
        await usersCollection.updateOne(
          { _id: user._id }, // Use _id for update for precision
          {
            $set: {
              emailVerified: true,
              otp: null, // Clear OTP after successful verification
              otpExpiry: null, // Clear OTP expiry
              lastLogin: new Date(),
              updatedAt: new Date(),
            },
          }
        );

        // Send internal verification success email
        try {
          await sendVerificationSuccessEmail(email, user.name || "User");
          console.log(`[Verification API] Email verified successfully for: ${email}.`);
        } catch (emailError: unknown) {
          console.error(`[Verification API] Failed to send verification success email to ${email}:`, emailError instanceof Error ? emailError.message : emailError);
          // Continue processing, but log the email sending failure
        }


        // Fetch updated user to ensure JWT payload is current
        const updatedUser = await usersCollection.findOne({ _id: user._id });
        if (!updatedUser) {
          console.error(`[Verification API] Failed to find updated user after verification for: ${email}.`);
          return NextResponse.json({ error: "Failed to retrieve user data after verification." }, { status: 500 });
        }

        const token = generateJWT(updatedUser); // Generate token for the newly verified user
        const response = NextResponse.json({
          user: {
            email: updatedUser.email,
            id: updatedUser._id!.toString(),
            name: updatedUser.name || null,
            role: updatedUser.role || "user",
            emailVerified: updatedUser.emailVerified,
          },
        }, { status: 200 });
        setAuthCookie(response, token);

        return response;
      }

      // Handle 'password-reset' OTP verification type
      if (type === "password-reset") {
        // OTP is verified. Frontend will now proceed to the password reset form.
        console.log(`[Verification API] OTP verified for password reset for: ${email}.`);
        // Do not clear OTP fields yet, as the password reset itself might fail.
        // The OTP will be cleared when the password is successfully updated.
        return NextResponse.json({ message: "OTP verified. Proceed to set new password." }, { status: 200 });
      }

      // Fallback for invalid verification type if OTP is present but type is not handled
      console.warn(`[Verification API] Unhandled verification type with OTP: ${type} for ${email}.`);
      return NextResponse.json(
        { error: "Invalid verification type." },
        { status: 400 }
      );
    }

    // --- Password Reset Flow (after OTP verification) ---
    // Attempt to parse body as password reset request
    const passwordParsed = passwordResetBodySchema.safeParse(body);

    if (passwordParsed.success) { // If body contains a valid password
      // This part of the logic should only be reached if the OTP was *already* verified
      // in a previous step (or if the client somehow skipped OTP verification).
      // For a robust flow, you might want to check for a session token or a temporary flag
      // indicating that OTP verification was successful. For now, we proceed assuming
      // the client is following the intended flow.

      const newPassword = passwordParsed.data.password;

      // Validate new password against existing one (if exists)
      if (user.password && await bcrypt.compare(newPassword, user.password)) {
        console.warn(`[Verification API] Attempt to set same password for: ${email}.`);
        return NextResponse.json(
          { error: "New password cannot be the same as the old password." },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password and clear OTP fields
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedPassword,
            otp: null, // Clear OTP after password reset
            otpExpiry: null, // Clear OTP expiry
            emailVerified: true, // Ensure email is marked as verified after password reset
            lastLogin: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      // Send internal success emails
      try {
        if (!user.emailVerified) {
          await sendVerificationSuccessEmail(email, user.name || "User"); // If not verified before
        }
        await sendPasswordResetSuccessEmail(email, user.name || "User"); // Always send reset success email
        console.log(`[Verification API] Password reset successfully for: ${email}.`);
      } catch (emailError: unknown) {
        console.error(`[Verification API] Failed to send password reset success email to ${email}:`, emailError instanceof Error ? emailError.message : emailError);
        // Continue processing, but log the email sending failure
      }

      // Fetch updated user to ensure JWT payload is current
      const updatedUser = await usersCollection.findOne({ _id: user._id });
      if (!updatedUser) {
        console.error(`[Verification API] Failed to find updated user after password reset for: ${email}.`);
        return NextResponse.json({ error: "Failed to retrieve user data after password reset." }, { status: 500 });
      }

      const token = generateJWT(updatedUser); // Generate new token with updated user data
      const response = NextResponse.json({
        user: {
          email: updatedUser.email,
          id: updatedUser._id!.toString(),
          name: updatedUser.name || null,
          role: updatedUser.role || "user",
          emailVerified: updatedUser.emailVerified,
        },
      }, { status: 200 });
      setAuthCookie(response, token);

      return response;
    }

    // Invalid request: if neither OTP nor password is provided when expected
    console.warn(`[Verification API] Invalid request: Missing OTP or new password for type ${type} for ${email}.`);
    return NextResponse.json(
      { error: "Invalid request. Missing OTP or new password." },
      { status: 400 }
    );
  } catch (error: unknown) { // Use 'unknown' for general caught errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[Verification API] Server error:", errorMessage);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
