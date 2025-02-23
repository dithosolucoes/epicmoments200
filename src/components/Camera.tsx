import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useStampDetection, DetectedStamp } from '@/hooks/useStampDetection';

interface CameraProps {
  onError?: () => void;
}

export function Camera({ onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { detectStamps, drawDetections } = useStampDetection();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number | null = null;
    let detectionInterval: NodeJS.Timeout | null = null;

    async function detectAndDraw() {
      if (!videoRef.current || !canvasRef.current || isProcessing) return;

      try {
        setIsProcessing(true);
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Obtém os dados da imagem do canvas
        const imageData = ctx.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // Detecta estampas
        const detections = await detectStamps(imageData);

        // Se encontrou alguma estampa, desenha as detecções
        if (detections.length > 0) {
          drawDetections(ctx, detections);
          toast.success(`${detections.length} estampa(s) detectada(s)!`, {
            id: 'stamp-detection' // Evita múltiplos toasts
          });
        }
      } catch (error) {
        console.error('Erro na detecção:', error);
      } finally {
        setIsProcessing(false);
      }
    }

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

        // Inicia a detecção periódica
        detectionInterval = setInterval(detectAndDraw, 1000); // Detecta a cada 1 segundo

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
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [onError, detectStamps, drawDetections, isProcessing]);

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
      {isProcessing && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
          Processando...
        </div>
      )}
    </div>
  );
}
