import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface CameraProps {
  onError?: () => void;
}

export function Camera({ onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        // Tenta primeiro a câmera traseira em dispositivos móveis
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { exact: 'environment' } }
            });
          } catch (err) {
            // Se falhar, tenta qualquer câmera
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            });
          }
        } else {
          // Em desktop, usa configuração padrão
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        }

        if (!videoRef.current) {
          throw new Error('Elemento de vídeo não encontrado');
        }

        // Limpa qualquer stream anterior
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        toast.success('Câmera iniciada com sucesso!');
      } catch (err) {
        console.error('Erro ao configurar câmera:', err);
        toast.error('Erro ao iniciar câmera');
        onError?.();
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onError]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
    </div>
  );
}
