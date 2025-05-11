
import React from "react";
import { Mic, MicOff, Video, VideoOff, Volume2, Share2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlBarProps {
  micEnabled: boolean;
  videoEnabled: boolean;
  onToggleMic: () => void;
  onToggleVideo: () => void;
  onToggleSettings: () => void;
  onToggleShare: () => void;
  onToggleSpeaker: () => void;
  onLeave: () => void;
  onRecord: () => void;
  isRecording: boolean;
  isMobile?: boolean;
}

const ControlBar = ({
  micEnabled,
  videoEnabled,
  onToggleMic,
  onToggleVideo,
  onToggleSettings,
  onToggleShare,
  onToggleSpeaker,
  onLeave,
  onRecord,
  isRecording,
  isMobile = false
}: ControlBarProps) => {
  return (
    <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-riverside-background border-t border-riverside-border w-full">
      <div className="flex-1 hidden sm:block">
        <div className="text-xs text-riverside-textSecondary">Start</div>
      </div>

      <div className="flex space-x-2 sm:space-x-4 flex-1 justify-center">
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMic}
            className={`rounded-full p-2 ${!micEnabled ? "bg-red-500/20 text-red-500" : "hover:bg-riverside-panel"}`}
          >
            {micEnabled ? <Mic size={isMobile ? 16 : 20} /> : <MicOff size={isMobile ? 16 : 20} />}
          </Button>
          <span className="text-xs text-riverside-textSecondary mt-1">Mic</span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVideo}
            className={`rounded-full p-2 ${!videoEnabled ? "bg-red-500/20 text-red-500" : "hover:bg-riverside-panel"}`}
          >
            {videoEnabled ? <Video size={isMobile ? 16 : 20} /> : <VideoOff size={isMobile ? 16 : 20} />}
          </Button>
          <span className="text-xs text-riverside-textSecondary mt-1">Cam</span>
        </div>

        {!isMobile && (
          <>
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSpeaker}
                className="rounded-full p-2 hover:bg-riverside-panel"
              >
                <Volume2 size={20} />
              </Button>
              <span className="text-xs text-riverside-textSecondary mt-1">Speaker</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleShare}
                className="rounded-full p-2 hover:bg-riverside-panel"
              >
                <Share2 size={20} />
              </Button>
              <span className="text-xs text-riverside-textSecondary mt-1">Share</span>
            </div>
          </>
        )}

        <div className="flex flex-col items-center">
          <Button
            variant="destructive"
            className="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
            onClick={onLeave}
          >
            Leave
          </Button>
        </div>
      </div>

      <div className="flex-1 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRecord}
          className={`rounded-full p-2 ${isRecording ? "bg-red-500 text-white" : "hover:bg-riverside-panel"}`}
        >
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecording ? "bg-red-500" : "bg-transparent"}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isRecording ? "bg-red-500" : "bg-riverside-textSecondary"}`}></span>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ControlBar;
