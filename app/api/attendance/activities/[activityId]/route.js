import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AttendanceActivity } from "@/lib/database/models/AttendanceActivity";
import { connectToDatabase } from "@/lib/database/connection";

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityId } = params;
    if (!activityId) {
      return NextResponse.json({
        success: false,
        message: "Activity ID is required"
      });
    }

    const deletedActivity = await AttendanceActivity.findByIdAndDelete(activityId);
    if (!deletedActivity) {
      return NextResponse.json({
        success: false,
        message: "Activity not found"
      });
    }

    return NextResponse.json({
      success: true,
      message: "Activity deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete activity"
    });
  }
} 