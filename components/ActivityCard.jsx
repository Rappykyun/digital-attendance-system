import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Building2, Users } from "lucide-react";

export default function ActivityCard({ activity, onMarkAttendance, type = "active" }) {
  const getStatusColor = (type) => {
    switch (type) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className={`p-6 border-2 ${getStatusColor(type)}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{activity.name}</h3>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {activity.description}
              </p>
            )}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(type)}`}>
            {type === "active" ? "Active Now" : "Upcoming"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(activity.startTime).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {new Date(activity.startTime).toLocaleTimeString()} - {new Date(activity.endTime).toLocaleTimeString()}
          </div>
          {activity.department && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              {activity.department}
            </div>
          )}
          {activity.section && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              Section {activity.section}
            </div>
          )}
        </div>

        {type === "active" && (
          <Button
            className="w-full mt-4"
            onClick={() => onMarkAttendance(activity)}
          >
            Mark Attendance
          </Button>
        )}
      </div>
    </Card>
  );
} 