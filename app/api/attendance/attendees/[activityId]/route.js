import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { connectToDatabase } from "@/lib/database/connection";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const department = searchParams.get("department");

    const activity = await AttendanceActivity.findById(params.activityId);

    if (!activity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found",
      });
    }

    let attendees = activity.attendees;

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      attendees = attendees.filter(
        attendee =>
          attendee.name.toLowerCase().includes(searchLower) ||
          attendee.department?.toLowerCase().includes(searchLower) ||
          attendee.section?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by department
    if (department) {
      attendees = attendees.filter(
        attendee => attendee.department === department
      );
    }

    // Sort attendees
    attendees.sort((a, b) => {
      let compareValue;
      switch (sortBy) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "department":
          compareValue = (a.department || "").localeCompare(b.department || "");
          break;
        case "timeIn":
          compareValue = new Date(a.timeIn) - new Date(b.timeIn);
          break;
        default:
          compareValue = 0;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    // Get unique departments for filtering
    const departments = [...new Set(attendees.map(a => a.department).filter(Boolean))];

    return NextResponse.json({
      success: true,
      attendees,
      departments,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch attendees",
    });
  }
} 