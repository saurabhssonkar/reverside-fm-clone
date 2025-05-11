import { useEffect, useRef } from "react";

const RemoteVideoParticipant = ({
    id,
    stream,
    name,
    resolution,
    onRemove
  }: {
    id: string;
    stream: MediaStream;
    name: string;
    resolution: string;
    onRemove: () => void;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
  
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
  
      return () => {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        onRemove();
      };
    }, [stream, onRemove]);
  
    return (
      <div className="border-2 border-blue-500 rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          id={`remote-video-${id}`}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2">
          {name} • {resolution}
        </div>
        <button 
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
        >
          ×
        </button>
      </div>
    );
  };

  export default RemoteVideoParticipant;