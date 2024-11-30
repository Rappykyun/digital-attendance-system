import { NextResponse } from "next/server";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { connectToDatabase } from "@/lib/database/connection";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const activity = await AttendanceActivity.findById(params.activityId);
    if (!activity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found",
      });
    }

    // Check if activity is active
    const now = new Date();
    if (now < activity.startTime || now > activity.endTime) {
      return NextResponse.json({
        success: false,
        message: "Activity is not currently active",
      });
    }

    const { studentId, verificationMethod } = await req.json();

    // Add attendance record
    activity.attendees.push({
      timeIn: now,
      verificationMethod,
    });

    // Save activity
    await activity.save();

    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
} 