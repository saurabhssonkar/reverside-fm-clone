 export  const startRecording = (stream,mediaRecorderRef,recordedChunksRef,socketRef) => {
    console.log("saurabh")

    const options = { mimeType: 'video/webm; codecs=vp9' };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
  
    mediaRecorder.ondataavailable = async function (event) {
        if (event.data && event.data.size > 0) {
          console.log("event.data.size ",typeof(event.data.size) )
          const arrayBuffer = await event.data.arrayBuffer(); 
          console.log("Chunk size in MB:", (arrayBuffer.byteLength / (1024 * 1024)).toFixed(2), "MB");
          // Convert Blob to ArrayBuffer
          socketRef.current.emit('recording-chunk', arrayBuffer);        // Send clean binary data
        }
      };
  
    mediaRecorder.onstop = () => {
      console.log("Recording stopped.");
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      recordedChunksRef.current = [];
  
      // Optional: send final blob or save locally
      // Example: upload to server or download
    };
  
    mediaRecorder.start(1000); // record in 1-second chunks
    console.log("Recording started.");
  };

  // export const stopRecording = () => {
  //   if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
  //     mediaRecorderRef.current.stop();
  //   }
  // };
  
  