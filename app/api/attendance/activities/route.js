import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { connectToDatabase } from "@/lib/database/connection";

export async function GET(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await AttendanceActivity.find()
      .sort({ startTime: -1 })
      .select('name startTime endTime status attendees');

    const formattedActivities = activities.map(activity => ({
      _id: activity._id,
      name: activity.name,
      startTime: activity.startTime,
      endTime: activity.endTime,
      status: activity.status,
      attendeeCount: activity.attendees?.length || 0
    }));

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch activities",
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Basic validation
    if (!data.name || !data.startTime || !data.endTime) {
      return NextResponse.json({
        success: false,
        message: "Name, start time, and end time are required",
      }, { status: 400 });
    }

    // Create activity
    const activity = await AttendanceActivity.create({
      name: data.name.trim(),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      department: data.department || "All",
      attendees: [],
    });

    return NextResponse.json({
      success: true,
      activity: {
        _id: activity._id,
        name: activity.name,
        startTime: activity.startTime,
        endTime: activity.endTime,
        status: activity.status,
        attendeeCount: 0
      },
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to create activity",
    }, { status: 500 });
  }
} 