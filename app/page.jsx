"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import LoginButton from "@/components/LoginButton";
import FaceRecognition from "@/components/FaceRecognition";
import ActivityCard from "@/components/ActivityCard";

export default function HomePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activities, setActivities] = useState({ active: [], upcoming: [] });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      redirect("/admin");
    }
  }, [session]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/student/activities");
      const data = await response.json();
      if (data.success) {
        // Separate activities into active and upcoming
        const now = new Date();
        const active = [];
        const upcoming = [];

        data.activities.forEach((activity) => {
          const startTime = new Date(activity.startTime);
          const endTime = new Date(activity.endTime);

          if (now >= startTime && now <= endTime) {
            active.push(activity);
          } else if (now < startTime) {
            upcoming.push(activity);
          }
        });

        setActivities({ active, upcoming });
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch activities",
      });
    }
  };

  const handleMarkAttendance = (activity) => {
    setSelectedActivity(activity);
    setShowAttendanceDialog(true);
  };

  const handleAttendanceSuccess = async (attendeeData) => {
    toast({
      title: "Success",
      description: "Attendance marked successfully",
    });
    setShowAttendanceDialog(false);
    fetchActivities();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header with Login */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Digital Attendance System</h1>
            <p className="text-muted-foreground">
              Mark your attendance using face recognition
            </p>
          </div>
          <LoginButton />
        </div>

        {/* Active Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Active Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {activities.active.map((activity) => (
                <ActivityCard
                  key={activity._id}
                  activity={activity}
                  onMarkAttendance={handleMarkAttendance}
                  type="active"
                />
              ))}
              {activities.active.length === 0 && (
                <p className="text-muted-foreground col-span-2 text-center py-4">
                  No active activities at the moment
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {activities.upcoming.map((activity) => (
                  <ActivityCard
                    key={activity._id}
                    activity={activity}
                    type="upcoming"
                  />
                ))}
                {activities.upcoming.length === 0 && (
                  <p className="text-muted-foreground col-span-2 text-center py-4">
                    No upcoming activities
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Face Recognition Dialog */}
        <Dialog
          open={showAttendanceDialog}
          onOpenChange={setShowAttendanceDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {selectedActivity?.name}
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <FaceRecognition
                activityId={selectedActivity?._id}
                onSuccess={handleAttendanceSuccess}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
