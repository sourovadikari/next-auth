import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { sendEmail } from "@/lib/mailer";
import { passwordResetConfirmedTemplate } from "@/templates/passwordResetConfirmed";
import { emailVerifiedTemplate } from "@/templates/verificationConfirmed";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token, password, action } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Check if token matches and hasn't expired
    const now = new Date();
    const isTokenValid = 
      user.verificationToken === token &&
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry > now &&
      user.verificationTokenPurpose === "password-reset";

    if (!isTokenValid) {
      return NextResponse.json(
        { 
          error: "Invalid or expired reset token. Please request a new password reset.",
          valid: false 
        },
        { status: 400 }
      );
    }

    // If action is 'verify', just return token validation status
    if (action === "verify") {
      return NextResponse.json(
        { valid: true, message: "Token is valid." },
        { status: 200 }
      );
    }

    // If action is 'reset' or no action specified, proceed with password reset
    if (!password) {
      return NextResponse.json(
        { error: "Password is required for password reset." },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password cannot be the same as your current password." },
        { status: 400 }
      );
    }

    // Track if user was unverified before
    let wasEmailUnverified = false;

    // Set email as verified if not already verified
    if (!user.emailVerified) {
      user.emailVerified = true;
      wasEmailUnverified = true;
      console.log(`Email verification set to true for user: ${user.email}`);
    }

    // Update password (pre-save hook hashes it)
    user.password = password;

    // Clear reset token fields
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.verificationTokenPurpose = undefined;

    // Save user
    await user.save();

    // Send password reset confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your Password Has Been Changed",
      html: passwordResetConfirmedTemplate(user.fullName || user.email),
    });

    // If email was just verified, send verification confirmation email
    if (wasEmailUnverified) {
      await sendEmail({
        to: user.email,
        subject: "Your Email is Now Verified",
        html: emailVerifiedTemplate(user.fullName || user.email),
      });
    }

    return NextResponse.json(
      { message: "Password has been successfully updated." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
