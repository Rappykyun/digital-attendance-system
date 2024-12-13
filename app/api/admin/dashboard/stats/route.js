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

    // Get current time for active activities check
    const now = new Date();

    // Get today's activities
    const todayActivities = await AttendanceActivity.find({
      startTime: { $gte: today, $lt: tomorrow }
    });

    // Get active activities count
    const activeActivities = await AttendanceActivity.countDocuments({
      startTime: { $lte: now },
      endTime: { $gte: now }
    });

    // Calculate attendance stats
    let presentCount = 0;

    for (const activity of todayActivities) {
      presentCount += activity.attendees.length;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        presentToday: presentCount,
        lateArrivals: activeActivities
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