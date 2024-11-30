import { NextResponse } from "next/server";
import { User } from "@/lib/database/models/User";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        department: user.department,
        section: user.section,
        faceData: user.faceData,
        lastAttendance: user.lastAttendance,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch user data",
    });
  }
}
