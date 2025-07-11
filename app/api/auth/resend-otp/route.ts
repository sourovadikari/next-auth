import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"; // Import Zod for validation
import clientPromise from "@/lib/database/mongodb";
import { generateOTP } from "@/lib/otp/genarate-otp";
import { sendOTPEmail } from "@/lib/email/send-otp"; // Adjust path if necessary
import { Db, ObjectId } from "mongodb"; // Import ObjectId for _id type

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
const resendOtpSchema = z.object({
  email: z.string().email("Invalid email format."),
  type: z.enum(["signup", "password-reset"], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: "Invalid verification type. Must be 'signup' or 'password-reset'." };
      }
      return { message: ctx.defaultError };
    },
  }),
});

/**
 * Handles POST requests to resend an OTP (One-Time Password) for email verification or password reset.
 * Implements measures to prevent email enumeration.
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json(); // Use 'unknown' for initial parsed body
    const parsed = resendOtpSchema.safeParse(body);

    // 1. Validate input using Zod
    if (!parsed.success) {
      console.warn("[ResendOTP API] Invalid input:", parsed.error.errors[0].message);
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, type } = parsed.data; // Destructure validated data

    const client = await clientPromise;
    const db: Db = client.db("auth");
    // FIX: Explicitly type the collection with UserDocument interface
    const usersCollection = db.collection<UserDocument>("users");

    // 2. Case-insensitive email lookup
    const user = await usersCollection.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    // 3. Security Measure: Always introduce a delay to defend against email enumeration,
    // regardless of whether the user is found or not.
    // This makes it harder for attackers to determine if an email exists in the system.
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay

    // 4. Handle cases where OTP should not be sent (user not found or already verified for signup)
    if (!user || (type === "signup" && user.emailVerified)) {
      console.log(`[ResendOTP API] Request for ${type} OTP to ${email}: User not found or email already verified (for signup). Returning generic success.`);
      return NextResponse.json(
        { message: "If an account with that email exists, a new OTP has been sent." },
        { status: 200 } // Always return 200 OK for security
      );
    }

    // 5. Generate and store new OTP
    const newOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

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

    // 6. Send OTP email
    // Wrap email sending in a try-catch to log errors but not necessarily
    // return an error to the client, maintaining the generic success message for security.
    try {
      await sendOTPEmail(user.email, newOtp, type);
      console.log(`[ResendOTP API] OTP ${newOtp} email sent to ${user.email} for ${type} verification.`);
    } catch (emailError: unknown) {
      const emailErrorMessage = emailError instanceof Error ? emailError.message : "Unknown email sending error.";
      console.error(`[ResendOTP API] Failed to send OTP email to ${user.email}:`, emailErrorMessage);
      // Continue to return 200 OK to the client to prevent email enumeration
    }

    // 7. Return generic success message
    return NextResponse.json(
      { message: "If an account with that email exists, a new OTP has been sent." },
      { status: 200 }
    );

  } catch (error: unknown) { // Use 'unknown' for caught errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[ResendOTP API] Server error:", errorMessage, error); // Log full error for debugging
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
