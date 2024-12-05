"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as faceapi from "face-api.js";
import AttendanceSuccessDialog from "./AttendanceSuccessDialog";
import AttendanceAlreadyMarkedDialog from "./AttendanceAlreadyMarkedDialog";

export default function FaceRecognition({ activityId, onSuccess }) {
  const { toast } = useToast();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [attendeeData, setAttendeeData] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [faceDescriptors, setFaceDescriptors] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        setIsModelLoading(true);
        console.log("Loading face recognition models...");
        
        // Load face-api models
        const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        
        console.log("Models loaded, fetching users...");
        
        // Load user face descriptors
        const response = await fetch('/api/face-recognition/users');
        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.success && data.users.length > 0) {
          // Process users with face data
          const processedUsers = data.users.map(user => {
            let descriptors = [];
            
            try {
              if (user.faceData && Array.isArray(user.faceData)) {
                // Handle array of face descriptors
                descriptors = user.faceData.map(faceStr => {
                  const faceObj = JSON.parse(faceStr);
                  return Float32Array.from(Object.values(faceObj));
                });
                console.log(`Processed ${descriptors.length} face descriptors for ${user.name}`);
              } else if (user.faceDescriptor) {
                // Handle single face descriptor
                descriptors = [Float32Array.from(Object.values(user.faceDescriptor))];
                console.log(`Processed single face descriptor for ${user.name}`);
              }
            } catch (error) {
              console.error(`Error processing face data for ${user.name}:`, error);
            }
            
            return {
              user,
              descriptors
            };
          });
          
          const validUsers = processedUsers.filter(u => u.descriptors.length > 0);
          console.log(`Found ${validUsers.length} users with valid face data`);
          
          if (validUsers.length > 0) {
            setFaceDescriptors(validUsers);
            toast({
              title: "Ready",
              description: `Loaded face data for ${validUsers.length} users`,
            });
          } else {
            throw new Error("No valid face data found");
          }
        } else {
          throw new Error("No users found with face data");
        }
      } catch (error) {
        console.error('Error initializing:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to initialize face recognition",
        });
      } finally {
        setIsModelLoading(false);
      }
    }

    init();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCapturing(false);
    }
  };

  const verifyFace = async () => {
    if (!videoRef.current || !isCapturing) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please start the camera first.",
      });
      return;
    }

    if (faceDescriptors.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No face data available for matching.",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('Starting face verification...');

      // Detect face
      console.log('Detecting face...');
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("FACE_NOT_DETECTED");
      }

      console.log('Face detected, matching with database...');

      // Find matching user
      let bestMatch = null;
      let smallestDistance = Infinity;

      // Compare with each user's face descriptors
      for (const { user, descriptors } of faceDescriptors) {
        console.log(`Comparing with ${user.name}'s descriptors...`);
        
        for (const referenceDescriptor of descriptors) {
          const distance = faceapi.euclideanDistance(detection.descriptor, referenceDescriptor);
          console.log(`Distance for ${user.name}:`, distance);
          
          if (distance < smallestDistance) {
            smallestDistance = distance;
            bestMatch = user;
          }
        }
      }

      console.log('Best match:', bestMatch ? bestMatch.name : 'None', 'Distance:', smallestDistance);

      // Check if match is good enough (0.6 is the threshold)
      if (!bestMatch || smallestDistance > 0.6) {
        throw new Error(`Face not recognized (confidence: ${((1 - smallestDistance) * 100).toFixed(1)}%). Please try again.`);
      }

      // First check if user has already marked attendance
      const checkResponse = await fetch(`/api/student/attendance/${activityId}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: bestMatch.id
        })
      });

      const checkData = await checkResponse.json();
      
      if (!checkData.success && checkData.message?.toLowerCase().includes("already marked")) {
        setShowDuplicateDialog(true);
        stopCamera();
        return;
      }

      // If not already marked, proceed with marking attendance
      const response = await fetch(`/api/student/attendance/${activityId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationMethod: "face",
          userId: bestMatch.id
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to mark attendance");
      }

      // Success
      toast({
        title: "Success",
        description: `Welcome, ${bestMatch.name}!`,
      });

      // Prepare attendee data for dialog
      const attendeeData = {
        name: bestMatch.name,
        email: bestMatch.email,
        department: bestMatch.department,
        section: bestMatch.section,
        timeIn: new Date().toISOString(),
        verificationMethod: "face"
      };

      setAttendeeData(attendeeData);
      setShowSuccessDialog(true);
      stopCamera();

    } catch (error) {
      // Provide specific tips based on error type
      let errorMessage = "Face verification failed";
      let description = "";

      if (error.message === "FACE_NOT_DETECTED") {
        errorMessage = "No face detected";
        description = "Tips:\n• Move closer to the camera\n• Ensure proper lighting\n• Look directly at the camera\n• Remove face coverings";
      } else if (error.message.includes("confidence")) {
        description = "Tips:\n• Ensure your face is well-lit\n• Remove glasses if possible\n• Try a different angle\n• Make sure your face data is up to date";
      } else {
        description = "Tips:\n• Check your camera permissions\n• Ensure stable internet connection\n• Try refreshing the page";
      }

      toast({
        variant: "destructive",
        title: errorMessage,
        description: description,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex justify-center gap-4">
        {!isCapturing ? (
          <Button
            onClick={startCamera}
            disabled={isModelLoading}
            className="w-full sm:w-auto"
          >
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button
              onClick={verifyFace}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : "Verify Face"}
            </Button>
            <Button
              variant="outline"
              onClick={stopCamera}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Stop Camera
            </Button>
          </>
        )}
      </div>

      <AttendanceSuccessDialog
        attendee={attendeeData}
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
      />

      <AttendanceAlreadyMarkedDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
      />
    </div>
  );
}
