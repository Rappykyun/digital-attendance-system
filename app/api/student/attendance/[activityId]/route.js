import { NextResponse } from "next/server";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { User } from "@/lib/database/models/User";
import { connectToDatabase } from "@/lib/database/connection";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    // Get activityId from params after awaiting
    const { activityId } = await params;

    const activity = await AttendanceActivity.findById(activityId);
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

    const { verificationMethod, userId } = await req.json();

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user already marked attendance
    const existingAttendance = activity.attendees.find(
      a => a.userId?.toString() === user._id.toString() || a.email === user.email
    );

    if (existingAttendance) {
      return NextResponse.json({
        success: false,
        message: "You have already marked your attendance for this activity",
      });
    }

    // Create attendance record with complete student details
    const attendanceRecord = {
      userId: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      section: user.section,
      timeIn: now,
      verificationMethod,
      deviceInfo: {
        userAgent: req.headers.get("user-agent"),
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    };

    // Add attendance record
    activity.attendees.push(attendanceRecord);

    // Save activity
    await activity.save();

    // Return success with complete attendee info
    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
      attendee: {
        name: user.name,
        email: user.email,
        department: user.department,
        section: user.section,
        timeIn: now,
        verificationMethod,
      },
    });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
} 