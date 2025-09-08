// app/api/check-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { available: null, error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { available: null, error: "Server error" },
      { status: 500 }
    );
  }
}
