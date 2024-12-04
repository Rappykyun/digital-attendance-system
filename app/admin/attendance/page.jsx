"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye } from "lucide-react";
import CreateActivityForm from "@/components/CreateActivityForm";
import AttendanceDialog from "@/components/AttendanceDialog";

export default function AttendancePage() {
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/attendance/activities");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      if (data.success) {
        setActivities(data.activities);
      } else {
        throw new Error(data.message || "Failed to fetch activities");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch activities",
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">Manage attendance activities</p>
        </div>

        <Dialog open={showNewActivityForm} onOpenChange={setShowNewActivityForm}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Activity
            </Button>
          </DialogTrigger>
          <CreateActivityForm
            onSuccess={() => {
              setShowNewActivityForm(false);
              fetchActivities();
            }}
          />
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity Name</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity._id}>
                <TableCell className="font-medium">{activity.name}</TableCell>
                <TableCell>
                  {new Date(activity.startTime).toLocaleString()} -{" "}
                  {new Date(activity.endTime).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      activity.status
                    )}`}
                  >
                    {activity.status}
                  </span>
                </TableCell>
                <TableCell>{activity.attendeeCount || 0}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setShowAttendanceDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {activities.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No activities found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AttendanceDialog
        activity={selectedActivity}
        open={showAttendanceDialog}
        onOpenChange={setShowAttendanceDialog}
      />
    </div>
  );
} 