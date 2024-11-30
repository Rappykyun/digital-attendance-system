"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import * as faceapi from "face-api.js";

export default function FaceCapture({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadModels();
    return () => {
      // Cleanup: stop camera when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
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
    } catch (error) {
      setError("Failed to load face detection models");
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraActive(true);
      setError("");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Could not access camera. Please make sure you have granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setError("No face detected. Please ensure your face is clearly visible.");
        return;
      }

      onCapture(detections.descriptor);
      setError("");
    } catch (error) {
      console.error("Error capturing face:", error);
      setError("Failed to capture face. Please try again.");
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isCameraActive ? "" : "hidden"}`}
        />
        
        {!isCameraActive && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant={isCameraActive ? "destructive" : "secondary"}
          onClick={toggleCamera}
          disabled={isLoading}
          className="flex-1"
        >
          {isCameraActive ? "Stop Camera" : "Start Camera"}
        </Button>

        {isCameraActive && (
          <Button
            type="button"
            onClick={captureImage}
            className="flex-1"
          >
            Capture Face
          </Button>
        )}
      </div>
    </div>
  );
} 