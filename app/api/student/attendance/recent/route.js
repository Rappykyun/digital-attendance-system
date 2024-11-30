import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { User } from "@/lib/database/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // Find activities where the user has attended
    const activities = await AttendanceActivity.find({
      "attendees.user": user._id
    })
    .sort({ "attendees.timeIn": -1 })
    .limit(5)
    .select('name startTime endTime attendees');

    // Extract and format attendance records
    const attendance = activities.map(activity => {
      const userAttendance = activity.attendees.find(
        a => a.user.toString() === user._id.toString()
      );
      return {
        _id: activity._id,
        activity: {
          name: activity.name,
          startTime: activity.startTime,
          endTime: activity.endTime,
        },
        timeIn: userAttendance.timeIn,
        verificationMethod: userAttendance.verificationMethod,
        comments: userAttendance.comments
      };
    });

    return NextResponse.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Error fetching recent attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch recent attendance",
    });
  }
} 