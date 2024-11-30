import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const activity = await AttendanceActivity.findById(params.activityId)
      .populate({
        path: "attendees.user",
        select: "name email section department",
      });

    if (!activity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found",
      });
    }

    let attendees = activity.attendees || [];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      attendees = attendees.filter(
        (attendee) =>
          attendee.user.name.toLowerCase().includes(searchLower) ||
          attendee.user.email.toLowerCase().includes(searchLower) ||
          (attendee.user.section &&
            attendee.user.section.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    attendees.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.user.name.localeCompare(b.user.name)
          : b.user.name.localeCompare(a.user.name);
      } else if (sortBy === "timeIn") {
        return sortOrder === "asc"
          ? new Date(a.timeIn) - new Date(b.timeIn)
          : new Date(b.timeIn) - new Date(a.timeIn);
      }
      return 0;
    });

    return NextResponse.json({
      success: true,
      attendees,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch attendees",
    });
  }
} 