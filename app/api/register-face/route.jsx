import { NextResponse } from "next/server";
import { User } from "@/lib/database/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, department, faceData } = await req.json();

    // Only email and faceData are required
    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    if (!email.endsWith("@sksu.edu.ph")) {
      return NextResponse.json({
        success: false,
        message: "Must use an institutional email (@sksu.edu.ph)",
      });
    }

    if (!Array.isArray(faceData) || faceData.length < 3) {
      return NextResponse.json({
        success: false,
        message: "At least 3 face samples required",
      });
    }

    const updateData = {
      role: "student",
      faceData: faceData.map((data) => JSON.stringify(data)),
    };

    // Add department if provided
    if (department) {
      updateData.department = department;
    }

    const user = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found. Please sign in with Google first.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Student registered successfully",
    });
  } catch (error) {
    console.error("Face registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
