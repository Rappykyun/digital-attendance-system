import { NextResponse } from "next/server";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { connectToDatabase } from "@/lib/database/connection";

export async function GET() {
  try {
    await connectToDatabase();
    
    const now = new Date();
    const activities = await AttendanceActivity.find({
      endTime: { $gte: now },
    })
      .select("name description startTime endTime department section")
      .sort({ startTime: 1 });

    // Add status to each activity
    const activitiesWithStatus = activities.map((activity) => {
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
      return activityData;
    });

    return NextResponse.json({
      success: true,
      activities: activitiesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
} 