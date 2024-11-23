import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function WebcamCapture({
  onCapture,
  isCapturing,
  onToggleCapture,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function setupCamera() {
      try {
        if (isCapturing) {
          setIsLoading(true);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });

          if (!mounted) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;

            // Wait for metadata to load before playing
            await new Promise((resolve) => {
              videoRef.current.onloadedmetadata = resolve;
            });

            if (mounted) {
              await videoRef.current.play();
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error("Error starting camera:", error);
        if (mounted) {
          onToggleCapture(false);
          setIsLoading(false);
        }
      }
    }

    setupCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCapturing, onToggleCapture]);

  return (
    <div className="relative w-full h-[480px] bg-black rounded-lg overflow-hidden">
      {isLoading && isCapturing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="text-white">Loading camera...</div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      <Button
        type="button"
        onClick={onCapture}
        className="absolute bottom-4 right-4 z-10"
        disabled={!isCapturing || isLoading}
      >
        <Camera className="mr-2 h-4 w-4" />
        Capture Face
      </Button>
    </div>
  );
}
