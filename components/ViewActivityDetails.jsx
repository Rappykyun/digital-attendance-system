"use client";
import { useState, useEffect } from "react";
import { DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

export default function ViewActivityDetails({ activity, onExport }) {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    fetchAttendees();
  }, [activity._id]);

  const fetchAttendees = async () => {
    try {
      const response = await fetch(`/api/attendance/attendees/${activity._id}`);
      const data = await response.json();
      if (data.success) {
        setAttendees(data.attendees);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{activity.name}</h3>
          <Button onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Attendance
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Time In</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((attendee) => (
                <TableRow key={attendee.user._id}>
                  <TableCell className="font-medium">
                    {attendee.user.name}
                  </TableCell>
                  <TableCell>{attendee.user.department || "-"}</TableCell>
                  <TableCell>{attendee.user.section || "-"}</TableCell>
                  <TableCell>
                    {new Date(attendee.timeIn).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {attendees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No attendees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DialogContent>
  );
} 