import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"; // Import Zod for validation
import clientPromise from "@/lib/database/mongodb";
import { generateOTP } from "@/lib/otp/genarate-otp";
import { sendOTPEmail } from "@/lib/email/send-otp"; // Adjust path if necessary
import { Db, ObjectId } from "mongodb"; // Import ObjectId for _id type if needed

// --- Type Definitions (If not already in a shared file like types/user.ts or types/db.ts) ---
// Define the structure of the user document as stored in MongoDB
interface UserDocument {
  _id: ObjectId;
  email: string;
  name?: string | null;
  role?: string;
  password?: string;
  emailVerified: boolean;
  otp?: string | null; // OTP field
  otpExpiry?: Date | null; // OTP expiry field
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  // Add other relevant fields from your user schema that might be stored in DB
}
// --- End Type Definitions ---


// Define Zod schema for input validation
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format."),
});

/**
 * Handles POST requests for initiating a password reset.
 * It generates an OTP and sends it to the user's email if registered.
 * For security, it returns a generic success message even if the email is not found
 * to prevent email enumeration attacks.
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json(); // Use 'unknown' for initial parsed body
    const parsed = forgotPasswordSchema.safeParse(body);

    // If validation fails, return a 400 Bad Request
    if (!parsed.success) {
      console.warn("[Forgot Password API] Invalid input:", parsed.error.errors[0].message);
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data; // Destructure validated data

    const client = await clientPromise;
    const db: Db = client.db("auth");
    // FIX: Explicitly type the collection with UserDocument interface
    const usersCollection = db.collection<UserDocument>("users");

    // Case-insensitive email lookup
    const user = await usersCollection.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    // IMPORTANT SECURITY: Return a generic success message even if the user is not found.
    // This prevents attackers from knowing which emails are registered in your system.
    if (!user) {
      console.log(`[Forgot Password API] Attempted password reset for unregistered email: ${email}`);
      return NextResponse.json(
        { message: "If your email is registered, a password reset code has been sent." },
        { status: 200 } // Return 200 OK even if user not found
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Update user document with new OTP and expiry
    // Use user._id for update for precision, or user.email if it's guaranteed unique and indexed
    await usersCollection.updateOne(
      { _id: user._id }, // Use user's ObjectId for update
      { $set: { otp, otpExpiry, updatedAt: new Date() } }
    );

    // Send OTP email
    // Ensure sendOTPEmail handles potential errors internally or is awaited with a try/catch
    try {
      await sendOTPEmail(user.email, otp, "password-reset");
      console.log(`[Forgot Password API] OTP email sent to ${user.email} for password reset.`);
    } catch (emailError: unknown) {
      const emailErrorMessage = emailError instanceof Error ? emailError.message : "Unknown email sending error.";
      console.error(`[Forgot Password API] Failed to send OTP email to ${user.email}:`, emailErrorMessage);
      // Do not return an error to the client here, maintain generic success message for security.
    }

    // Log OTP in development for debugging (do not do this in production)
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Forgot Password API] OTP for password reset: ${otp} for email: ${user.email}`);
    }

    // Return success message
    return NextResponse.json(
      { message: "If your email is registered, a password reset code has been sent." },
      { status: 200 }
    );
  } catch (error: unknown) { // Use 'unknown' for caught errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[Forgot Password API] Server error:", errorMessage, error); // Log full error for debugging
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
