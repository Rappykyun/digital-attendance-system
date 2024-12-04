import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users, 
  Mail,
  Calendar,
  X
} from "lucide-react";

export default function AttendanceSuccessDialog({ attendee, open, onOpenChange }) {
  if (!attendee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Attendance Marked Successfully
            </DialogTitle>
            <DialogDescription className="text-center">
              {new Date(attendee.timeIn).toLocaleString()}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Student Name */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-primary">{attendee.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{attendee.email}</p>
          </div>

          {/* Student Details */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Department</span>
              </div>
              <span className="text-sm font-semibold">{attendee.department || "-"}</span>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Section</span>
              </div>
              <span className="text-sm font-semibold">{attendee.section || "-"}</span>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <span className="text-sm font-semibold">
                {new Date(attendee.timeIn).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time</span>
              </div>
              <span className="text-sm font-semibold">
                {new Date(attendee.timeIn).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 