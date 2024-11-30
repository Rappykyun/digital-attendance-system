import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activity = await AttendanceActivity.findById(params.activityId)
      .select('name description startTime endTime status department section');

    if (!activity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found",
      });
    }

    // Update status based on current time
    const now = new Date();
    let status;
    if (now < activity.startTime) {
      status = "upcoming";
    } else if (now >= activity.startTime && now <= activity.endTime) {
      status = "active";
    } else {
      status = "completed";
    }

    const activityData = activity.toObject();
    activityData.status = status;

    return NextResponse.json({
      success: true,
      activity: activityData,
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch activity",
    });
  }
} 