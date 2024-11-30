"use client";
import { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function CreateActivityForm({ onSuccess }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Activity name is required",
      });
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Start time and end time are required",
      });
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (endTime <= startTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "End time must be after start time",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/attendance/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          startTime: formData.startTime,
          endTime: formData.endTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Activity created successfully",
        });
        onSuccess();
      } else {
        throw new Error(data.message || "Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create activity",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Activity</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="name">
              Activity Name
            </label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="Enter activity name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium" htmlFor="startTime">
                Start Time
              </label>
              <Input
                id="startTime"
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={handleChange("startTime")}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="endTime">
                End Time
              </label>
              <Input
                id="endTime"
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={handleChange("endTime")}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current mr-2" />
              Creating...
            </>
          ) : (
            "Create Activity"
          )}
        </Button>
      </form>
    </DialogContent>
  );
} 