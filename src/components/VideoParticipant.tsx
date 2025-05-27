import React, { forwardRef, useRef, useImperativeHandle, useEffect, useState } from "react";
import { Mic, MicOff, Crown, ScreenShare, ScreenShareOff } from "lucide-react";

interface VideoParticipantProps {
  name: string;
  isHost?: boolean;
  resolution: string;
  isMuted: boolean;
  isSpeaking?: boolean;
  stream?: MediaStream;
  borderColor: string;
  isScreenSharing?: boolean;
  connectionQuality?: "excellent" | "good" | "poor";
}

const VideoParticipant = forwardRef<HTMLVideoElement, VideoParticipantProps>(
  (
    {
      name,
      isHost = false,
      resolution,
      isMuted,
      isSpeaking = false,
      stream,
      borderColor,
      isScreenSharing = false,
      connectionQuality = "good",
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoLoading, setIsVideoLoading] = useState(true);

    // Combine forwarded ref with internal ref
    useImperativeHandle(ref, () => videoRef.current!);
    console.log("saurabhStream",stream)

    // Handle stream changes
    useEffect(() => {
      if (videoRef.current ) {
        const videoElement = videoRef.current;
        
        const handleLoadedData = () => setIsVideoLoading(false);
        const handleError = () => setIsVideoLoading(true);

        videoElement.srcObject = stream;
        videoElement.addEventListener('loadeddata', handleLoadedData);
        videoElement.addEventListener('error', handleError);

        return () => {
          videoElement.removeEventListener('loadeddata', handleLoadedData);
          videoElement.removeEventListener('error', handleError);
        };
      }
    }, [stream]);

    // Get quality indicator color
    const getQualityColor = () => {
      switch (connectionQuality) {
        case "excellent": return "bg-green-500";
        case "good": return "bg-yellow-500";
        case "poor": return "bg-red-500";
        default: return "bg-gray-500";
      }
    };

    return (
      <div className={`relative border-2 ${borderColor} rounded-lg overflow-hidden ${isSpeaking ? "ring-2 ring-blue-400" : ""}`}>
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={`w-full h-full object-cover ${isVideoLoading ? 'bg-gray-800' : ''}`}
          aria-label={`Video feed of ${name}`}
        />

        {/* Loading State */}
        {isVideoLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="animate-pulse text-white">Connecting...</div>
          </div>
        )}

        {/* Participant Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Mic Status */}
              {isMuted ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4 text-green-500" />
              )}

              {/* Name and Resolution */}
              <span className="text-white text-sm font-medium truncate">
                {name} {isHost && <Crown className="h-3 w-3 inline ml-1 text-yellow-400" />}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Screen Share Indicator */}
              {isScreenSharing && (
                <ScreenShare className="h-4 w-4 text-blue-400" />
              )}

              {/* Resolution */}
              <span className="text-white text-xs">{resolution}</span>
            </div>
          </div>
        </div>

        {/* Connection Quality Indicator */}
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          <span className={`h-2 w-2 rounded-full ${getQualityColor()}`}></span>
          <span className="text-white text-xs capitalize">{connectionQuality}</span>
        </div>

        {/* Host Badge */}
        {isHost && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full">
            Host
          </div>
        )}
      </div>
    );
  }
);

VideoParticipant.displayName = "VideoParticipant";

export default VideoParticipant;