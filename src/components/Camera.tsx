import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface CameraProps {
  onError?: () => void;
}

export function Camera({ onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number | null = null;

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

        if (!videoRef.current || !canvasRef.current) {
          throw new Error('Elementos de vídeo ou canvas não encontrados');
        }

        // Limpa qualquer stream anterior
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Configura o canvas com o mesmo tamanho do vídeo
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        };

        // Inicia o loop de renderização
        function render() {
          if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              // Desenha o frame atual do vídeo no canvas
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );
            }
          }
          animationFrame = requestAnimationFrame(render);
        }

        render();
        toast.success('Câmera iniciada com sucesso!');
      } catch (err) {
        console.error('Erro ao configurar câmera:', err);
        toast.error('Erro ao iniciar câmera');
        onError?.();
      }
    }

    setupCamera();

    return () => {
      // Limpa recursos
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onError]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* O vídeo fica invisível, mas é necessário para capturar o stream */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />
      {/* O canvas é usado para renderizar o vídeo e as detecções */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
