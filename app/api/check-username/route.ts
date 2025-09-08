// app/api/check-username/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { available: null, error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    return NextResponse.json({ available: !existingUser });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json(
      { available: null, error: "Server error" },
      { status: 500 }
    );
  }
}
