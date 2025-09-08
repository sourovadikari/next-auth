import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { generateToken, generateTokenExpiry } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { emailVerificationTemplate } from "@/templates/emailVerification";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, username, password } = body;

    if (!fullName || !email || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailSanitized = email.toLowerCase().trim();
    const usernameSanitized = username.toLowerCase().trim();

    await connectToDatabase();

    const emailExists = await User.findOne({ email: emailSanitized });
    if (emailExists) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const usernameExists = await User.findOne({ username: usernameSanitized });
    if (usernameExists) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Generate verification token and expiry
    const token = generateToken();
    const tokenExpiry = generateTokenExpiry();

    const newUser = new User({
      fullName,
      email: emailSanitized,
      username: usernameSanitized,
      password, // hashed in pre-save hook
      role: "user",
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpiry: tokenExpiry,
      verificationTokenPurpose: "signup",
    });

    await newUser.save();

    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify?email=${encodeURIComponent(emailSanitized)}&token=${token}`;

    // Send verification email
    await sendEmail({
      to: emailSanitized,
      subject: "Verify Your Email",
      html: emailVerificationTemplate(fullName || usernameSanitized, verificationUrl),
    });

    return NextResponse.json(
      { message: "User created. Verification email sent." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
