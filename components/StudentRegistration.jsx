import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, X } from "lucide-react";
import * as faceapi from "face-api.js";
import WebcamCapture from "./WebcamCapture";

export default function StudentRegistration() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    department: "",
  });
  const [faceDescriptors, setFaceDescriptors] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const MODEL_URL = "https://raw.githubusercontent.com/Rappykyun/face-api.js/master/weights";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      console.log("Face detection models loaded successfully");
    } catch (error) {
      console.error("Error loading models:", error);
      setCameraError("Failed to load face detection models");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraToggle = (shouldCapture) => {
    setIsCapturing(shouldCapture);
    if (!shouldCapture) {
      setCameraError("");
    }
  };

  const handleCapture = async () => {
    try {
      const videoElement = document.querySelector('video');
      if (!videoElement) return;

      const detection = await faceapi
        .detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setFaceDescriptors((prev) => [...prev, detection.descriptor]);
      } else {
        setCameraError("No face detected. Please try again.");
      }
    } catch (error) {
      console.error("Error capturing face:", error);
      setCameraError("Failed to capture face. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/register-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          faceData: faceDescriptors,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Student registered successfully!");
        resetForm();
      } else {
        setCameraError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setCameraError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      department: "",
    });
    setFaceDescriptors([]);
    handleCameraToggle(false);
    setCameraError("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register Student Face Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label>Department (Optional)</label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Information Systems">Information Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Face Registration</h3>
              <Button
                type="button"
                variant={isCapturing ? "destructive" : "default"}
                onClick={() => handleCameraToggle(!isCapturing)}
                disabled={isLoading}
              >
                {isCapturing ? "Stop Camera" : "Start Camera"}
              </Button>
            </div>

            {cameraError && (
              <div className="text-red-500 text-sm">{cameraError}</div>
            )}

            {isCapturing && (
              <WebcamCapture
                isCapturing={isCapturing}
                onCapture={handleCapture}
                onToggleCapture={handleCameraToggle}
              />
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">
                Captured faces: {faceDescriptors.length} / 3 required
              </span>
              {faceDescriptors.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFaceDescriptors([])}
                  className="text-red-500 hover:text-red-700"
                >
                  Clear captures
                </Button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || faceDescriptors.length < 3}
          >
            {isLoading ? "Registering..." : "Register Student"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}