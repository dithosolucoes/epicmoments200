import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { Button } from './ui/button';

export default function ARScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStarted(false);
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Para a câmera atual se estiver rodando
      stopCamera();

      // Primeira tentativa: câmera traseira
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { exact: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsStarted(true);
          toast.success('Câmera iniciada com sucesso!');
          return;
        }
      } catch (err) {
        console.log('Falha ao tentar câmera traseira, tentando qualquer câmera...');
      }

      // Segunda tentativa: qualquer câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStarted(true);
        toast.success('Câmera iniciada com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao iniciar câmera:', err);
      toast.error('Erro ao iniciar câmera. Por favor, verifique as permissões do navegador.');
      setIsStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpa recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
      {!isStarted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4">
          <Camera className="w-12 h-12 text-white" />
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={startCamera}
              disabled={isLoading}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {isLoading ? 'Iniciando...' : 'Iniciar Câmera'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <Button
            onClick={stopCamera}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
          >
            Parar Câmera
          </Button>
        </>
      )}
    </div>
  );
}
