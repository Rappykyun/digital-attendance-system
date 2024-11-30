import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Download, Search, Filter } from "lucide-react";

export default function ViewActivityDialog({ activity, onClose, onExport }) {
  const [attendees, setAttendees] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    sortBy: "name", // name, timeIn
    sortOrder: "asc", // asc, desc
  });

  useEffect(() => {
    fetchAttendees();
  }, [activity._id, filter]);

  const fetchAttendees = async () => {
    try {
      const response = await fetch(
        `/api/attendance/attendees/${activity._id}?` + new URLSearchParams(filter)
      );
      const data = await response.json();
      if (data.success) {
        setAttendees(data.attendees);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="relative border-b">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto py-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-lg text-green-800 mb-4">{activity.name}</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Department:</span> {activity.department}</p>
                <p><span className="font-medium">Section:</span> {activity.section || "All"}</p>
                <p><span className="font-medium">Start Time:</span> {new Date(activity.startTime).toLocaleString()}</p>
                <p><span className="font-medium">End Time:</span> {new Date(activity.endTime).toLocaleString()}</p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </p>
              </div>
              {activity.description && (
                <div className="mt-4">
                  <p className="font-medium">Description:</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Attendees ({attendees.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(activity._id)}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search attendees..."
                    className="pl-10"
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  />
                </div>
                <Select
                  value={filter.sortBy}
                  onValueChange={(value) => setFilter({ ...filter, sortBy: value })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
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
            </div>
          </div>

          <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee._id}>
                    <TableCell className="font-medium">{attendee.user.name}</TableCell>
                    <TableCell>{attendee.user.email}</TableCell>
                    <TableCell>{attendee.user.section || "-"}</TableCell>
                    <TableCell>{new Date(attendee.timeIn).toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          attendee.verificationMethod === "face"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {attendee.verificationMethod}
                      </span>
                    </TableCell>
                    <TableCell>{attendee.comments || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 