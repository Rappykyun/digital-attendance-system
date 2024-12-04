"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import FaceRecognition from "@/components/FaceRecognition";

export default function MarkAttendancePage({ params }) {
  const { data: session, status } = useSession();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    if (session?.user?.email === process.env.ADMIN_EMAIL) {
      redirect("/");
    }
  }, [session, status]);

  useEffect(() => {
    if (session) {
      fetchActivity();
    }
  }, [session, params.activityId]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/student/activities/${params.activityId}`);
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
        if (data.activity.status !== "active") {
          setError("This activity is not currently active for attendance.");
        }
      } else {
        setError(data.message || "Failed to fetch activity details");
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
      setError("Failed to load activity details");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSuccess = async (attendeeData) => {
    // Don't set success immediately - let the dialog stay open
    // The success state will be set when user closes the dialog
    setSuccess(true);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error ? (
            <Card className="p-6 bg-red-50 border border-red-200">
              <div className="flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>{error}</p>
              </div>
            </Card>
          ) : success ? (
            <Card className="p-6 bg-green-50 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-green-800 mb-2">Attendance Recorded!</h2>
                  <p className="text-green-600">Your attendance has been successfully recorded.</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <Button
                className="mt-4 w-full bg-green-600 hover:bg-green-700"
                onClick={() => redirect("/")}
              >
                Back to Home
              </Button>
            </Card>
          ) : activity ? (
            <div className="space-y-6">
              <Card className="p-6 bg-white shadow-lg">
                <h1 className="text-2xl font-bold text-green-800 mb-4">{activity.name}</h1>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(activity.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(activity.startTime).toLocaleTimeString()} - {new Date(activity.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-gray-600 mt-2">{activity.description}</p>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-white shadow-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Face Recognition</h2>
                <FaceRecognition onSuccess={handleAttendanceSuccess} />
              </Card>

              <Card className="p-6 bg-white shadow-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Additional Comments</h2>
                <Textarea
                  placeholder="Add any comments about your attendance (optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="mb-4"
                />
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 