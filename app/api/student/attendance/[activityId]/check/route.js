import { NextResponse } from "next/server";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { User } from "@/lib/database/models/User";
import { connectToDatabase } from "@/lib/database/connection";

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const { activityId } = await params;
    const { userId } = await req.json();

    // Validate inputs
    if (!activityId || !userId) {
      return NextResponse.json({
        success: false,
        message: "Missing required parameters",
      });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // Find the activity and check for existing attendance by name
    const activity = await AttendanceActivity.findOne({
      _id: activityId,
      'attendees.name': user.name
    });

    // If activity is found with matching attendee name, it means attendance exists
    if (activity) {
      const existingAttendance = activity.attendees.find(
        a => a.name === user.name
      );

      return NextResponse.json({
        success: false,
        message: "You have already marked your attendance for this activity",
        studentName: user.name,
        timeMarked: existingAttendance.timeIn
      });
    }

    // Now check if activity exists and is active
    const currentActivity = await AttendanceActivity.findById(activityId);
    if (!currentActivity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found",
      });
    }

    // Check if activity is still active
    const now = new Date();
    if (now < currentActivity.startTime || now > currentActivity.endTime) {
      return NextResponse.json({
        success: false,
        message: "Activity is not currently active",
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