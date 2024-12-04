import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users, 
  Mail,
  GraduationCap,
  Fingerprint
} from "lucide-react";

export default function AttendanceSuccessDialog({ attendee, open, onOpenChange }) {
  if (!attendee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Attendance Marked Successfully
          </DialogTitle>
          <DialogDescription className="text-center">
            Your attendance has been recorded at {new Date(attendee.timeIn).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Student Name */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-primary">{attendee.name}</h3>
          </div>

          {/* Student Details */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <span className="text-sm">{attendee.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Department</span>
              </div>
              <span className="text-sm">{attendee.department || "-"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Section</span>
              </div>
              <span className="text-sm">{attendee.section || "-"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time</span>
              </div>
              <span className="text-sm">{new Date(attendee.timeIn).toLocaleTimeString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Method</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {attendee.verificationMethod}
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