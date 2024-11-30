"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import FaceCapture from "./FaceCapture";

const departments = [
  "Computer Science",
  "Information Technology",
  "Information Systems",
];

export default function StudentRegistration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    section: "",
  });
  const [faceData, setFaceData] = useState([]);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.department) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }
      if (!formData.email.endsWith("@sksu.edu.ph")) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please use your institutional email (@sksu.edu.ph)",
        });
        return;
      }
      setStep(2);
      return;
    }

    if (faceData.length < 3) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please capture at least 3 face samples",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/register-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          faceData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Student registered successfully",
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          department: "",
          section: "",
        });
        setFaceData([]);
        setStep(1);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error registering student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to register student",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceCapture = (descriptor) => {
    setFaceData((prev) => [...prev, descriptor]);
    toast({
      title: "Success",
      description: `Face sample ${faceData.length + 1} captured`,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Register Student</h2>
        <p className="text-muted-foreground">
          Register a new student for face recognition attendance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="name">
                Student Name
              </label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter student's full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="email">
                Institutional Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="student@sksu.edu.ph"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Department</label>
              <Select
                required
                value={formData.department}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, department: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="section">
                Section
              </label>
              <Input
                id="section"
                value={formData.section}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, section: e.target.value }))
                }
                placeholder="Enter section (e.g., A, B, C)"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">Face Registration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please capture at least 3 face samples. Make sure the students
                face is well-lit and centered.
              </p>
              <FaceCapture onCapture={handleFaceCapture} />
              <div className="mt-4">
                <p className="text-sm">
                  Samples captured: {faceData.length} / 3
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {step === 2 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current mr-2" />
                {step === 1 ? "Next" : "Registering..."}
              </>
            ) : (
              step === 1 ? "Next" : "Register Student"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}