import { NextResponse } from "next/server";
import { Admin } from "@/lib/database/models/Admin";
import { connectToDatabase } from "@/lib/database/connection";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { email, password, name } = await req.json();

    // Basic validation
    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        message: "All fields are required",
      }, { status: 400 });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin with this email already exists",
      }, { status: 400 });
    }

    // Create new admin
    const admin = await Admin.create({
      email,
      password,
      name,
    });

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create admin",
    }, { status: 500 });
  }
} 