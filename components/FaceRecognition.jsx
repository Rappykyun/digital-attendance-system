"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import * as faceapi from "face-api.js";
import { useToast } from "@/hooks/use-toast";

export default function FaceRecognition({ onSuccess, isLoading }) {
  const { toast } = useToast();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
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
      setIsModelLoading(true);
      const MODEL_URL = "https://raw.githubusercontent.com/Rappykyun/face-api.js/master/weights";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    } catch (error) {
      setError("Failed to load face detection models");
    } finally {
      setIsModelLoading(false);
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

  const verifyFace = async () => {
    if (!videoRef.current || isLoading) return;

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No face detected. Please ensure your face is clearly visible.",
        });
        return;
      }

      onSuccess(detections.descriptor);
    } catch (error) {
      console.error("Error verifying face:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify face. Please try again.",
      });
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
        
        {!isCameraActive && !isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {isModelLoading && (
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
          disabled={isModelLoading || isLoading}
          className="flex-1"
        >
          {isCameraActive ? "Stop Camera" : "Start Camera"}
        </Button>

        {isCameraActive && (
          <Button
            type="button"
            onClick={verifyFace}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current mr-2" />
                Verifying...
              </>
            ) : (
              "Verify Face"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
