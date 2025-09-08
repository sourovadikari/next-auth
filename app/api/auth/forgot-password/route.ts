import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { generateToken, generateTokenExpiry } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { passwordResetTemplate } from "@/templates/passwordReset";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Email or username is required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanId = identifier.toLowerCase().trim();

    // Find user by email OR username
    const user = await User.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Generate new reset token and expiry
    const resetToken = generateToken();
    const resetExpiry = generateTokenExpiry();

    // Update user document with reset token info and timestamp
    user.verificationToken = resetToken;
    user.verificationTokenExpiry = resetExpiry;
    user.verificationTokenPurpose = "password-reset";

    await user.save();

    // Compose password reset URL
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/new-password?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(resetToken)}`;

    // Send password reset email
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: passwordResetTemplate(user.fullName || user.email, resetUrl),
    });

    return NextResponse.json(
      { message: "Password reset link has been sent." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
