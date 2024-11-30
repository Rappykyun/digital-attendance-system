import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activityId");

    const activity = await AttendanceActivity.findById(activityId).populate({
      path: "attendees.user",
      select: "name email section department",
    });

    if (!activity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found",
      });
    }

    // Sort attendees by department and name
    const attendees = [...activity.attendees].sort((a, b) => {
      const deptCompare = (a.user.department || "").localeCompare(b.user.department || "");
      if (deptCompare !== 0) return deptCompare;
      return a.user.name.localeCompare(b.user.name);
    });

    // Create CSV content
    const csvRows = [
      // Header row
      [
        "Name",
        "Email",
        "Department",
        "Section",
        "Time In",
        "Verification Method",
        "Comments",
      ].join(","),
      // Data rows
      ...attendees.map((attendee) =>
        [
          `"${attendee.user.name}"`,
          `"${attendee.user.email}"`,
          `"${attendee.user.department || ""}"`,
          `"${attendee.user.section || ""}"`,
          `"${new Date(attendee.timeIn).toLocaleString()}"`,
          `"${attendee.verificationMethod}"`,
          `"${attendee.comments || ""}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Create the response with CSV content
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance_${activity.name}_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting attendance:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to export attendance data",
    });
  }
} 