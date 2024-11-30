"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";
import FaceRecognition from "@/components/FaceRecognition";
import LoginButton from "@/components/LoginButton";

export default function HomePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        setActivities(data.activities);
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

  const handleAttendanceSuccess = async (faceDescriptor) => {
    if (!selectedActivity) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/student/attendance/${selectedActivity._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verificationMethod: "face",
            faceDescriptor,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Attendance marked successfully",
        });
        setShowAttendanceDialog(false);
        fetchActivities();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to mark attendance",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700";
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        {/* Header with Login */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Digital Attendance System</h1>
          <LoginButton />
        </div>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Activities</CardTitle>
            <CardDescription>
              Activities that are currently active or upcoming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <Card key={activity._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{activity.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(activity.startTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(activity.startTime).toLocaleTimeString()} -{" "}
                          {new Date(activity.endTime).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(activity.status)}
                        >
                          {activity.status}
                        </Badge>
                        {activity.status === "active" && (
                          <Button
                            onClick={() => {
                              setSelectedActivity(activity);
                              setShowAttendanceDialog(true);
                            }}
                          >
                            Mark Attendance
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active activities found
                  </div>
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
              <DialogTitle>Mark Attendance - {selectedActivity?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FaceRecognition
                onSuccess={handleAttendanceSuccess}
                isLoading={isLoading}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
