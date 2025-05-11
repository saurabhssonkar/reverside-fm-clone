import React, { forwardRef } from "react";
import { Mic, MicOff } from "lucide-react";

interface VideoParticipantProps {
  name: string;
  isHost?: boolean;
  resolution?: string;
  isMuted?: boolean;
  borderColor?: string;
}

const VideoParticipant = forwardRef<HTMLVideoElement, VideoParticipantProps>(
  ({ name, isHost = false, resolution = "", isMuted = false, borderColor = "border-gray-300" }, ref) => {
    console.log("refvideo",ref)
    return (
      <div className={`relative rounded-lg overflow-hidden border-2 ${borderColor}`}>
        <div className="relative w-full h-full">
          <video
            ref={ref}
            autoPlay
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center space-x-1">
            <span className="text-white text-sm font-medium">{name}</span>
            {isHost && <span className="text-xs text-riverside-textSecondary ml-1">Host</span>}
          </div>

          <div className="flex items-center space-x-2">
            {isMuted ? (
              <MicOff size={16} className="text-riverside-textSecondary" />
            ) : (
              <Mic size={16} className="text-white" />
            )}
            <span className="text-xs text-riverside-textSecondary">{resolution}</span>
          </div>
        </div>
      </div>
    );
  }
);

export default VideoParticipant;
