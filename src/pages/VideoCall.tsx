
import Header from "@/components/Header";
import VideoParticipant from "@/components/VideoParticipant";
import ControlBar from "@/components/ControlBar";
import SidePanel from "@/components/SidePanel";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import {
  Users, MessageSquare, Music
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const VideoCall = () => {
  interface VideoRef {
    srcObject: MediaStream;
    current: HTMLVideoElement | null;
  }
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});


  const remoteVideoRefs = useRef<Map<string, VideoRef>>(new Map());
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // For single remote participant

  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const isMobile = useIsMobile();


  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLVideoElement>(null);

  const roomName = window.location.pathname.split('/')[2];
  console.log("roomName", roomName)

  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);


  const [socket, setSocket] = useState(null);
  const [device, setDevice] = useState(null);
  const [rtpCapabilities, setRtpCapabilities] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [consumerTransports, setConsumerTransports] = useState([]);
  const [consumingTransports, setConsumingTransports] = useState([]);
  const [audioProducer, setAudioProducer] = useState(null);
  const [videoProducer, setVideoProducer] = useState(null);


  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);

  const audioParamsRef = useRef({});
  const videoParamsRef = useRef({
    encodings: [
      { rid: 'r0', maxBitrate: 100000, scalabilityMode: 'S1T3' },
      { rid: 'r1', maxBitrate: 300000, scalabilityMode: 'S1T3' },
      { rid: 'r2', maxBitrate: 900000, scalabilityMode: 'S1T3' },
    ],
    codecOptions: { videoGoogleStartBitrate: 1000 }
  });
  useEffect(() => {
    console.log('remoteStreams state changed:', remoteStreams);
  }, [remoteStreams]);

  useEffect(() => {
    const socket = io('https://localhost:3000/mediasoup', {
      transports: ['websocket'],
      secure: true,
      rejectUnauthorized: false,
    });
    socketRef.current = socket;


    console.log("sock", socket)
    setSocket(socket);

    socket.on('connection-success', ({ socketId }) => {
      console.log('Connected:', socketId);
      getLocalStream(socket);
    });

    socket.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId));
    socket.on('producer-closed', ({ remoteProducerId }) => closeConsumer(remoteProducerId));
  }, []);

  const getLocalStream = (socket) => {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { min: 640, max: 1920 },
        height: { min: 400, max: 1080 }
      }
    }).then(stream => {
      localVideoRef.current.srcObject = stream;

      audioParamsRef.current = { track: stream.getAudioTracks()[0] };
      videoParamsRef.current = {
        ...videoParamsRef.current,
        track: stream.getVideoTracks()[0]
      } as any;
      // startRecording(stream,mediaRecorderRef,recordedChunksRef,socketRef);

      joinRoom(socket);
    }).catch(err => console.error(err));
  };

  const joinRoom = (socket) => {
    socket.emit('joinRoom', { roomName }, (data) => {
      setRtpCapabilities(data.rtpCapabilities);
      createDevice(data.rtpCapabilities, socket);
    });
  };

  const createDevice = async (routerRtpCapabilities, socket) => {
    try {
      const newDevice = new mediasoupClient.Device();
      await newDevice.load({ routerRtpCapabilities });
      deviceRef.current = newDevice
      setDevice(newDevice);
      console.log('Device RTP Capabilities', newDevice.rtpCapabilities);
      createSendTransport(newDevice, socket);
    } catch (error) {
      console.error(error);
    }
  };

  const createSendTransport = (device, socket) => {
    console.log("saurabh", device)
    socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      if (params.error) {
        console.error(params.error);
        return;
      }

      const transport = device.createSendTransport(params);
      setProducerTransport(transport);

      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emit('transport-connect', { dtlsParameters });
          callback();
        } catch (err) {
          errback(err);
        }
      });

      transport.on('produce', async (parameters, callback, errback) => {
        try {
          socket.emit('transport-produce', {
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
          }, ({ id, producersExist }) => {
            callback({ id });
            if (producersExist) getProducers(socket);
          });
        } catch (err) {
          errback(err);
        }
      });

      connectSendTransport(transport);
    });
  };

  const connectSendTransport = async (transport) => {
    const audioProd = await transport.produce(audioParamsRef.current);
    const videoProd = await transport.produce(videoParamsRef.current);
    setAudioProducer(audioProd);
    setVideoProducer(videoProd);
  };

  const getProducers = (socket) => {
    socket.emit('getProducers', (producerIds) => {
      producerIds.forEach(signalNewConsumerTransport);
      // producerIds.forEach((producerId) => signalNewConsumerTransport(producerId, socket));

    });
  };

  const signalNewConsumerTransport = async (remoteProducerId) => {
    console.log(remoteProducerId, "remoteProducerId", socket, "socket")
    if (consumingTransports.includes(remoteProducerId)) return;
    setConsumingTransports(prev => [...prev, remoteProducerId]);

    socketRef.current.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
      // console.log("params",deviceRef.current)
      const consumerTransport = deviceRef.current.createRecvTransport(params);

      consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await socketRef.current.emit('transport-recv-connect', {
            dtlsParameters,
            serverConsumerTransportId: params.id,
          });
          callback();
        } catch (err) {
          errback(err);
        }
      });

      connectRecvTransport(consumerTransport, remoteProducerId, params.id);
    });
  };

  const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
    socketRef.current.emit('consume', {
      rtpCapabilities: deviceRef.current.rtpCapabilities,
      remoteProducerId,
      serverConsumerTransportId,
    }, async ({ params }) => {
      if (params.error) return;

      const consumer = await consumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters,
      });



      setConsumerTransports(prev => [
        ...prev,
        {
          consumerTransport,
          serverConsumerTransportId: params.id,
          producerId: remoteProducerId,
          consumer,
        }
      ]);


      // const newElem = document.createElement('div');
      // newElem.id = `td-${remoteProducerId}`;
      // console.log(" newElem.id", newElem.id)
      // newElem.className = params.kind === 'video' ? 'remoteVideo' : '';
      // newElem.innerHTML = `<${params.kind} id="${remoteProducerId}" autoplay class="video" />`;

      // videoContainerRef.current.appendChild(newElem);

      // (document.getElementById(remoteProducerId) as HTMLMediaElement).srcObject = new MediaStream([consumer.track]);
      // console.log("new",newElem)
      //   ------------------------------------       ----------------------------------

      // const mediaElem = document.createElement('video');
      // // mediaElem.id = remoteProducerId;
      // mediaElem.autoplay = true;
      // mediaElem.playsInline = true;
      // mediaElem.className = 'w-full h-full object-cover';

      // // Create and store ref object
      // remoteVideoRef.current = mediaElem
      // // remoteVideoRefs.current.set(remoteProducerId, remoteVideoRef);

      // // Assign stream
      // remoteVideoRef.current.srcObject = new MediaStream([consumer.track]);

      // // Append to container
      // if (videoContainerRef.current) {
      //   videoContainerRef.current.appendChild(mediaElem);
      // }


      const stream = new MediaStream([consumer.track]);
      setRemoteStreams(prev => ({
        ...prev,
        [remoteProducerId]: stream
      }));
    
      // Cleanup when track ends
      consumer.track.onended = () => {
        setRemoteStreams(prev => {
          const newStreams = {...prev};
          delete newStreams[remoteProducerId];
          return newStreams;
        });
      };



      // Directly assign the stream to the media element
      // mediaElem.srcObject = new MediaStream([consumer.track]);
      // console.log("remoteVideoRef", remoteVideoRef);
      // console.log("videoContainerRef", videoContainerRef);
      // console.log("remoteVideoRefs", remoteVideoRefs)
      // console.log("localvideoRef", localVideoRef)




      socketRef.current.emit('consumer-resume', { serverConsumerId: params.serverConsumerId });
    });
  };

  const closeConsumer = (remoteProducerId) => {
    console.log("producer are closed", consumerTransports)
    const transportData = consumerTransports.find(data => data.producerId === remoteProducerId);
    if (transportData) {
      transportData.consumerTransport.close();
      transportData.consumer.close();

      setConsumerTransports(prev =>
        prev.filter(data => data.producerId !== remoteProducerId)
      );

      const videoElem = document.getElementById(`td-${remoteProducerId}`);
      if (videoElem) videoElem.remove();
    }
  };





  // Dummy placeholder URLs
  const jeffVideoSrc = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";
  const lauraVideoSrc = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80";

  const handleToggleMic = () => setMicEnabled(!micEnabled);
  const handleToggleVideo = () => setVideoEnabled(!videoEnabled);
  const handleToggleRecord = () => setIsRecording(!isRecording);

  const handleLeave = () => {
    alert("Leave meeting");
  };

  return (
    <div className="flex flex-col h-screen bg-riverside-background">
      <Header
        sessionName="Lumix Unboxing"
        onInvite={() => alert("Invite participants")}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-2 sm:p-4 overflow-y-auto">
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-4 h-full`}>
            <VideoParticipant
  name="Local"
  isHost={true}
  resolution="1080p"
  isMuted={!micEnabled}
  ref={localVideoRef}
  stream={null} // Pass your local stream here
  borderColor="border-purple-500"
/>

{Object.entries(remoteStreams).map(([id, stream]) => (
  <VideoParticipant
    key={id}
    name={`Remote ${id.slice(0, 4)}`}
    resolution="720p"
    isMuted={false}
    stream={stream}
    borderColor="border-blue-500"
  />
))}
              {/* <div ref={remoteVideoRef} className="remote-video-container" /> */}

            </div>
          </div>

          <ControlBar
            micEnabled={micEnabled}
            videoEnabled={videoEnabled}
            isRecording={isRecording}
            onToggleMic={handleToggleMic}
            onToggleVideo={handleToggleVideo}
            onToggleSettings={() => alert("Settings")}
            onToggleShare={() => alert("Share screen")}
            onToggleSpeaker={() => alert("Speaker settings")}
            onLeave={handleLeave}
            onRecord={handleToggleRecord}
            isMobile={isMobile}
          />
        </div>

        {showSidePanel && (
          <div className={`${isMobile ? 'fixed inset-0 z-10 bg-riverside-panel/80' : 'relative'}`}>
            <SidePanel onClose={() => setShowSidePanel(false)} />
          </div>
        )}
      </div>

      <div className={`absolute ${isMobile ? 'bottom-20' : 'bottom-16'} right-4 flex flex-col space-y-2`}>
        {!showSidePanel && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-riverside-panel border-riverside-border"
            onClick={() => setShowSidePanel(true)}
          >
            <Users size={20} />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-riverside-panel border-riverside-border"
        >
          <MessageSquare size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-riverside-panel border-riverside-border"
        >
          <Music size={20} />
        </Button>
      </div>


    </div>
  );
};

export default VideoCall;
