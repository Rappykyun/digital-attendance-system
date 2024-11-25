import { useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import WebcamCapture from "./WebcamCapture";

export default function FaceRecognition({ onSuccess }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const MODEL_URL =
        "https://raw.githubusercontent.com/Rappykyun/face-api.js/master/weights";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    } catch (error) {
      setError("Failed to load face detection models");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async () => {
    try {
      const videoElement = document.querySelector("video");
      if (!videoElement) return;

      const detection = await faceapi
        .detectSingleFace(videoElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const descriptorObj = Object.assign({}, detection.descriptor);
        
        const response = await fetch("/api/verify-face", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            faceDescriptor: descriptorObj,
          }),
        });

        const data = await response.json();
        console.log('Verification response:', data);
        
        if (data.success) {
          onSuccess();
          setIsCapturing(false);
          setError("");
        } else {
          setError(data.message || "Face not recognized. Please try again.");
        }
      } else {
        setError("No face detected. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to verify face. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Face Recognition Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setIsCapturing(!isCapturing)}
            disabled={isLoading}
          >
            {isCapturing ? "Stop Camera" : "Start Camera"}
          </Button>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {isCapturing && (
          <WebcamCapture
            isCapturing={isCapturing}
            onCapture={handleCapture}
            onToggleCapture={setIsCapturing}
          />
        )}
      </CardContent>
    </Card>
  );
}
