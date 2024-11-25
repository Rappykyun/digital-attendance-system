"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import FaceRecognition from "@/components/FaceRecognition";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [lastAttendance, setLastAttendance] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    if (session?.user?.role === "admin") {
      redirect("/admin");
    }
  }, [session, status]);

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.email) {
        const response = await fetch(`/api/user?email=${session.user.email}`);
        const data = await response.json();
        console.log("User data response:", data);
        if (data.success) {
          setUserData(data.user);
          console.log("Face data:", data.user.faceData);
          if (data.user.lastAttendance) {
            setLastAttendance(new Date(data.user.lastAttendance));
          }
        }
      }
    }
    fetchUserData();
  }, [session]);

  const handleAttendanceSuccess = () => {
    setLastAttendance(new Date());
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Student Information</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
                <p className="text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
            {userData?.department && (
              <p className="text-gray-600">
                Department: {userData.department}
              </p>
            )}
            {lastAttendance && (
              <p className="text-green-600">
                Last Attendance: {lastAttendance.toLocaleString()}
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {userData?.faceData?.length ? (
            <FaceRecognition onSuccess={handleAttendanceSuccess} />
          ) : (
            <Card className="p-6 bg-yellow-50">
              <p className="text-yellow-600">
                Face data not registered yet. Please contact an administrator.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
