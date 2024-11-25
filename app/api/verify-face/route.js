import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { User } from "@/lib/database/models/User";
import { compareFaceDescriptors } from "@/lib/face-utils";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { faceDescriptor } = await req.json();
    const user = await User.findOne({ email: session.user.email });

    if (!user?.faceData?.length) {
      return NextResponse.json({
        success: false,
        message: "No registered face data found",
      });
    }

    // Compare with stored descriptors
    const storedDescriptors = user.faceData.map(d => JSON.parse(d));
    let minDistance = Infinity;
    
    for (const stored of storedDescriptors) {
      const distance = compareFaceDescriptors(stored, faceDescriptor);
      console.log('Face comparison distance:', distance); // Debug log
      minDistance = Math.min(minDistance, distance);
    }

    const THRESHOLD = 0.6; // Adjust this value based on testing
    const matches = minDistance <= THRESHOLD;

    if (matches) {
      await User.findOneAndUpdate(
        { email: session.user.email },
        { lastAttendance: new Date() }
      );

      return NextResponse.json({
        success: true,
        message: "Attendance recorded successfully",
      });
    }

    return NextResponse.json({
      success: false,
      message: "Face not recognized",
      debug: { minDistance, threshold: THRESHOLD } // Debug info
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({
      success: false,
      message: "Verification failed",
      error: error.message
    });
  }
}
