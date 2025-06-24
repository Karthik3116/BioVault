// src/hooks/useCamera.js
import { useState, useEffect } from 'react';

export function useCamera(videoRef, cameraOn) {
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;

    async function getCameraStream() {
      if (cameraOn) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError(`Camera access denied or unavailable: ${err.message}`);
        }
      } else {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    }

    getCameraStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn, videoRef]);

  return { error };
}