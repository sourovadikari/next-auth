import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { isTokenExpired } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { emailVerifiedTemplate } from "@/templates/verificationConfirmed";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const emailRaw = searchParams.get("email");
    const token = searchParams.get("token");

    if (!emailRaw || !token) {
      return NextResponse.json(
        { error: "Email and verification token are required." },
        { status: 400 }
      );
    }

    const email = emailRaw.toLowerCase().trim();

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check token validity and expiry together - treat expired as invalid
    if (
      user.verificationToken !== token ||
      !user.verificationTokenExpiry ||
      isTokenExpired(user.verificationTokenExpiry)
    ) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    if (user.verificationTokenPurpose !== "signup") {
      return NextResponse.json(
        { error: "Invalid verification token purpose." },
        { status: 400 }
      );
    }

    // Mark email as verified and clear verification fields
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.verificationTokenPurpose = undefined;

    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Email is Now Verified",
        html: emailVerifiedTemplate(user.username || user.email),
      });
    } catch (emailError) {
      console.error("Failed to send verification confirmation email:", emailError);
      // Do not fail request if email fails
    }

    return NextResponse.json(
      { message: "Email successfully verified." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
