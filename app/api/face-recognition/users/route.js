import { NextResponse } from "next/server";
import { User } from "@/lib/database/models/User";
import { connectToDatabase } from "@/lib/database/connection";

export async function GET() {
  try {
    await connectToDatabase();
    console.log("Fetching users with face data...");

    // Find users with face descriptors
    const users = await User.find({
      $or: [
        { faceDescriptor: { $exists: true } },
        { faceData: { $exists: true } }
      ]
    }).select('name email department section faceDescriptor faceData');

    console.log(`Found ${users.length} users with face data`);
    
    // Log the first user's data for debugging
    if (users.length > 0) {
      console.log("Sample user data:", {
        name: users[0].name,
        hasFaceDescriptor: !!users[0].faceDescriptor,
        hasFaceData: !!users[0].faceData
      });
    }

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        section: user.section,
        faceDescriptor: user.faceDescriptor,
        faceData: user.faceData
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch users",
    });
  }
} 