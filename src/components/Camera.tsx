import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasPermission(true);
        }
      } catch (error) {
        console.error('Erro ao acessar câmera:', error);
        setHasPermission(false);
        toast.error('Erro ao acessar câmera. Por favor, permita o acesso.');
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (hasPermission === null) {
    return <div>Solicitando acesso à câmera...</div>;
  }

  if (hasPermission === false) {
    return <div>Acesso à câmera negado. Por favor, permita o acesso e recarregue a página.</div>;
  }

  return (
    <video
      ref={videoRef}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      playsInline
      muted
      autoPlay
    />
  );
}
