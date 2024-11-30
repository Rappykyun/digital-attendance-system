import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { connectToDatabase } from "@/lib/database/connection";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all activities sorted by start time (newest first)
    const activities = await AttendanceActivity.find()
      .sort({ startTime: -1 })
      .select('name startTime endTime status attendees');

    // Format activities for response
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
    });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.name || !data.startTime || !data.endTime) {
      return NextResponse.json({
        success: false,
        message: "Name, start time, and end time are required",
      });
    }

    // Validate dates
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (endTime <= startTime) {
      return NextResponse.json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Create activity with minimal required fields
    const activity = new AttendanceActivity({
      name: data.name.trim(),
      startTime,
      endTime,
      attendees: [],
      department: "All", // Set default department
      status: startTime > new Date() ? "upcoming" : 
              endTime < new Date() ? "completed" : "active"
    });

    await activity.save();

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
      message: "Activity created successfully",
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({
        success: false,
        message: "Invalid data provided",
        errors: Object.values(error.errors).map(err => err.message),
      });
    }

    return NextResponse.json({
      success: false,
      message: error.message || "Failed to create activity",
    });
  }
} 