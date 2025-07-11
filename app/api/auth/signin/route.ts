import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"; // Import Zod for validation
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/database/mongodb";
import { generateOTP } from "@/lib/otp/genarate-otp";
import { sendOTPEmail } from "@/lib/email/send-otp"; // Adjust path if necessary
import { Db, ObjectId } from "mongodb"; // Import ObjectId for _id type
import { UserSession } from "@/lib/providers/AuthProvider"; // Import UserSession interface from shared types/auth.ts

// --- Type Definitions (Should ideally be in a shared file like types/db.ts or types/user.ts) ---
// Define the structure of the user document as stored in MongoDB
interface UserDocument {
  _id: ObjectId;
  email: string;
  password?: string; // Password is required for credentials login but optional for OAuth
  name?: string | null;
  role?: string;
  emailVerified: boolean;
  otp?: string | null;
  otpExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  // Add other fields from your user schema if they are part of the stored document
}
// --- End Type Definitions ---

// Schema for sign-in validation
const signinSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d"; // 7 days

/**
 * Handles POST requests for user sign-in.
 * Authenticates user credentials, manages email verification, and issues JWT tokens.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Server Configuration Check: Ensure JWT_SECRET is defined
    if (!JWT_SECRET) {
      console.error("[SignIn API] Server configuration error: JWT_SECRET is not defined.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    // 2. Parse and validate input using Zod
    const body: unknown = await req.json(); // Use 'unknown' for initial parsed body
    const parsed = signinSchema.safeParse(body);

    if (!parsed.success) {
      console.warn("[SignIn API] Invalid input:", parsed.error.errors[0].message);
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data; // Destructure validated data

    // 3. Connect to MongoDB
    const client = await clientPromise;
    const db: Db = client.db("auth");
    // FIX: Explicitly type the collection with UserDocument interface
    const usersCollection = db.collection<UserDocument>("users");

    // 4. Case-insensitive search for user by email
    const user = await usersCollection.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    // 5. User and Password Verification
    // Return generic "Invalid credentials" to prevent email enumeration
    if (!user) {
      console.log(`[SignIn API] Authentication attempt with unregistered email: ${email}`);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Ensure user has a password field if trying to sign in with credentials
    if (!user.password) {
        console.warn(`[SignIn API] User ${email} found but has no password (e.g., OAuth user).`);
        return NextResponse.json(
            { error: "Invalid credentials or account created via different method." },
            { status: 401 }
        );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log(`[SignIn API] Authentication attempt with incorrect password for email: ${email}`);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 6. Check Email Verification Status
    if (!user.emailVerified) {
      console.log(`[SignIn API] Unverified email login attempt for: ${email}. Resending OTP.`);
      // Generate new OTP for verification
      const newOtp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await usersCollection.updateOne(
        { _id: user._id }, // Use user's _id for precise update
        {
          $set: {
            otp: newOtp,
            otpExpiry,
            updatedAt: new Date(),
          },
        }
      );

      // Send OTP email
      try {
        await sendOTPEmail(user.email, newOtp, "signup");
        // Log OTP in development for debugging (do not do this in production)
        if (process.env.NODE_ENV !== "production") {
          console.log(`[SignIn API] OTP for email verification: ${newOtp} for email: ${user.email}`);
        }
      } catch (emailError: unknown) {
        const emailErrorMessage = emailError instanceof Error ? emailError.message : "Unknown email sending error.";
        console.error(`[SignIn API] Failed to send OTP email to ${user.email}:`, emailErrorMessage);
        // Do not block login or change response for email sending failure, but log it.
      }


      // Instruct frontend to redirect for verification
      return NextResponse.json(
        {
          error: "Email not verified. A new verification code has been sent to your email address.",
          redirect: true,
          url: `/verification/${encodeURIComponent(user.email)}/signup`,
        },
        { status: 403 } // Forbidden: User exists but access is denied due to unverified email
      );
    }

    // 7. Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name || null, // Ensure name is handled as potentially null
        role: user.role || "user",
      } as UserSession, // Type assertion for JWT payload
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 8. Update lastLogin timestamp
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );

    // 9. Create response with token cookie
    const response = NextResponse.json({ message: "Signed in successfully" }, { status: 200 });
    response.cookies.set("token", token, {
      httpOnly: true, // Prevent client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "lax", // Protect against CSRF attacks
      path: "/", // Cookie valid for all paths
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    console.log(`[SignIn API] User ${user.email} signed in successfully.`);
    return response;

  } catch (error: unknown) { // Use 'unknown' for caught errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[SignIn API] Server error:", errorMessage, error); // Log full error for debugging
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
