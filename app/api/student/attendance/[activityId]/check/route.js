import { NextResponse } from "next/server";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { User } from "@/lib/database/models/User";
import { connectToDatabase } from "@/lib/database/connection";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const { activityId } = await params;
    const { userId } = await req.json();

    const activity = await AttendanceActivity.findById(activityId);
    if (!activity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found",
      });
    }

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

    return NextResponse.json({
      success: true,
      message: "Attendance can be marked",
    });
  } catch (error) {
    console.error("Error checking attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to check attendance status",
    });
  }
} 