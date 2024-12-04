import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@/lib/database/models/User";
import { connectToDatabase } from "@/lib/database/connection";

export async function GET(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department");
    const section = searchParams.get("section");

    // Build query
    const query = {
      role: "student" // Only get students
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (department && department !== "all") {
      query.department = department;
    }

    if (section && section !== "all") {
      query.section = section;
    }

    const students = await User.find(query)
      .select("name email department section isActive")
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch students",
    });
  }
} 