import { NextResponse } from "next/server";
import { User } from "@/lib/database/models/User";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/database/connection";

export async function POST(req) {
  try {
    // Ensure database connection
    await connectToDatabase();

    const { name, email, department, section, faceData } = await req.json();

    if (!name || !email || !department) {
      return NextResponse.json({
        success: false,
        message: "Name, email, and department are required",
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      department,
      section,
      role: "student",
      faceData: faceData.map((data) => JSON.stringify(data)),
      registeredAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Student registered successfully",
      user: {
        name: user.name,
        email: user.email,
        department: user.department,
        section: user.section,
      },
    });
  } catch (error) {
    console.error("Error registering student:", error);
    
    // Handle specific errors
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({
        success: false,
        message: "Invalid data provided. Please check all fields.",
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    return NextResponse.json({
      success: false,
      message: error.message || "Failed to register student",
    });
  }
}
