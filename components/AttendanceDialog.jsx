import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function AttendanceDialog({ activity, open, onOpenChange }) {
  const { toast } = useToast();
  const [attendees, setAttendees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    department: "all",
    sortBy: "name",
    sortOrder: "asc",
  });

  useEffect(() => {
    if (open && activity) {
      fetchAttendees();
    }
  }, [open, activity, filter]);

  const fetchAttendees = async () => {
    try {
      const params = new URLSearchParams({
        ...filter,
        department: filter.department === "all" ? "" : filter.department,
      });
      const response = await fetch(
        `/api/attendance/attendees/${activity._id}?${params}`
      );
      const data = await response.json();
      if (data.success) {
        setAttendees(data.attendees);
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch attendees",
      });
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.text(activity.name, 14, 15);
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(activity.startTime).toLocaleDateString()}`, 14, 25);
      doc.text(`Time: ${new Date(activity.startTime).toLocaleTimeString()} - ${new Date(activity.endTime).toLocaleTimeString()}`, 14, 32);
      
      // Add department summary if filtering by department
      if (filter.department) {
        doc.text(`Department: ${filter.department}`, 14, 39);
      }
      
      // Add table
      const tableData = attendees.map((attendee) => [
        attendee.name,
        attendee.department || "-",
        attendee.section || "-",
        new Date(attendee.timeIn).toLocaleString(),
      ]);

      doc.autoTable({
        startY: filter.department ? 45 : 39,
        head: [["Name", "Department", "Section", "Time In"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Add summary
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text(`Total Attendees: ${attendees.length}`, 14, finalY);

      doc.save(`${activity.name}-attendance.pdf`);

      toast({
        title: "Success",
        description: "Attendance report exported successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export attendance report",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{activity?.name} - Attendance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {new Date(activity?.startTime).toLocaleString()} -{" "}
              {new Date(activity?.endTime).toLocaleString()}
            </div>
            <Button onClick={exportToPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search attendees..."
                className="pl-10"
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
              />
            </div>

            <Select
              value={filter.department}
              onValueChange={(value) =>
                setFilter({ ...filter, department: value })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.sortBy}
              onValueChange={(value) => setFilter({ ...filter, sortBy: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="timeIn">Time In</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() =>
                setFilter({
                  ...filter,
                  sortOrder: filter.sortOrder === "asc" ? "desc" : "asc",
                })
              }
            >
              <Filter
                className={`h-4 w-4 ${
                  filter.sortOrder === "desc" ? "transform rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Time In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee._id}>
                    <TableCell className="font-medium">
                      {attendee.name}
                    </TableCell>
                    <TableCell>{attendee.department || "-"}</TableCell>
                    <TableCell>{attendee.section || "-"}</TableCell>
                    <TableCell>
                      {new Date(attendee.timeIn).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {attendees.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No attendees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 