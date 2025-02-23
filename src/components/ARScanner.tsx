import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { Button } from './ui/button';

export default function ARScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Lista todas as câmeras disponíveis
  const listCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('Câmeras disponíveis:', videoDevices);
      setDevices(videoDevices);
      
      // Se houver câmeras disponíveis, seleciona a primeira por padrão
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Erro ao listar câmeras:', err);
      toast.error('Não foi possível listar as câmeras disponíveis');
    }
  };

  useEffect(() => {
    listCameras();
    
    // Atualiza a lista de câmeras quando dispositivos são conectados/desconectados
    navigator.mediaDevices.addEventListener('devicechange', listCameras);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', listCameras);
    };
  }, []);

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
      // Verifica suporte básico
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Para a câmera atual se estiver rodando
      stopCamera();

      // Tenta primeiro a câmera traseira, se falhar tenta a frontal
      const constraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: devices.length > 1 ? 'environment' : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!videoRef.current) {
        throw new Error('Elemento de vídeo não encontrado');
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      setIsStarted(true);
      toast.success('Câmera iniciada com sucesso!');
    } catch (err) {
      console.error('Erro ao iniciar câmera:', err);
      
      // Tenta novamente com configurações mais básicas se falhou
      if (err instanceof Error && err.name === 'OverconstrainedError') {
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            await videoRef.current.play();
            setIsStarted(true);
            toast.success('Câmera iniciada com configurações básicas');
            return;
          }
        } catch (basicErr) {
          console.error('Falha também com configurações básicas:', basicErr);
        }
      }
      
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
            {devices.length > 1 && (
              <select
                className="bg-white text-black px-4 py-2 rounded-lg mb-2"
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Câmera ${devices.indexOf(device) + 1}`}
                  </option>
                ))}
              </select>
            )}
            <Button
              onClick={startCamera}
              disabled={isLoading || devices.length === 0}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {isLoading ? 'Iniciando...' : 'Iniciar Câmera'}
            </Button>
            <p className="text-white text-sm">
              {devices.length === 0 
                ? 'Nenhuma câmera detectada'
                : `Câmeras detectadas: ${devices.length}`}
            </p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
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
