import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { User } from "@/lib/database/models/User";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { connectToDatabase } from "@/lib/database/connection";

export async function GET(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's active activities
    const todayActivities = await AttendanceActivity.find({
      startTime: { $gte: today, $lt: tomorrow }
    });

    // Calculate attendance stats
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = totalStudents;

    for (const activity of todayActivities) {
      for (const attendee of activity.attendees) {
        // Count as present
        presentCount++;
        absentCount--;

        // Check if late (15 minutes grace period)
        const attendanceTime = new Date(attendee.timeIn);
        const activityStart = new Date(activity.startTime);
        const lateThreshold = new Date(activityStart.getTime() + 15 * 60000); // 15 minutes in milliseconds

        if (attendanceTime > lateThreshold) {
          lateCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        presentToday: presentCount,
        lateArrivals: lateCount,
        absent: absentCount
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
} 