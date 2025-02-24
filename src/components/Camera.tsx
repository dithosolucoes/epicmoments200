import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useStampDetection } from '@/hooks/useStampDetection';

interface CameraProps {
  onError?: () => void;
}

export function Camera({ onError }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { detectStamps, drawDetections, isModelLoading } = useStampDetection();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number | null = null;
    let detectionInterval: NodeJS.Timeout | null = null;

    async function detectAndDraw() {
      if (!videoRef.current || !canvasRef.current || isProcessing || isModelLoading) return;

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
        const constraints = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          ? { video: { facingMode: { exact: 'environment' } } }
          : { video: { width: { ideal: 1280 }, height: { ideal: 720 } } };

        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
          // Se falhar com a câmera traseira, tenta qualquer câmera
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } }
          });
        }

        if (!videoRef.current || !canvasRef.current) {
          throw new Error('Elementos de vídeo ou canvas não encontrados');
        }

        // Configura o tamanho do canvas antes de tudo
        canvasRef.current.width = 1280;
        canvasRef.current.height = 720;

        // Limpa qualquer stream anterior
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }

        // Configura o novo stream
        videoRef.current.srcObject = stream;
        
        // Espera o vídeo carregar
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject(new Error('Video element not found'));
          
          videoRef.current.onloadedmetadata = () => {
            if (!videoRef.current || !canvasRef.current) return reject(new Error('Elements not found'));
            
            // Atualiza o tamanho do canvas com base no vídeo
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            
            resolve();
          };
          
          videoRef.current.onerror = () => {
            reject(new Error('Failed to load video'));
          };
        });

        // Inicia a reprodução do vídeo
        await videoRef.current.play();

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

        // Inicia a detecção periódica após um delay inicial para carregar os modelos
        setTimeout(() => {
          detectionInterval = setInterval(detectAndDraw, 1000); // Detecta a cada 1 segundo
        }, 2000);

        toast.success('Câmera iniciada com sucesso!');
      } catch (err) {
        console.error('Erro ao configurar câmera:', err);
        toast.error('Erro ao iniciar câmera. Por favor, verifique as permissões.');
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
  }, [onError, detectStamps, drawDetections, isProcessing, isModelLoading]);

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
      {(isProcessing || isModelLoading) && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
          {isModelLoading ? 'Carregando modelos...' : 'Processando...'}
        </div>
      )}
    </div>
  );
}
