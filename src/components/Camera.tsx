import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    try {
      // Primeiro, verifica se já temos permissão
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permission.state === 'denied') {
        throw new Error('Permissão da câmera foi negada. Por favor, redefina as permissões do site nas configurações do navegador.');
      }

      return true;
    } catch (err) {
      console.error('Erro ao verificar permissão:', err);
      return false;
    }
  };

  const setupCamera = async () => {
    try {
      setError(null);
      setHasPermission(null);

      // Verifica permissão primeiro
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        throw new Error('Não foi possível obter permissão da câmera');
      }

      // Lista todas as câmeras disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      console.log('Câmeras disponíveis:', cameras);

      let stream: MediaStream | null = null;

      // Tenta primeiro a câmera traseira em dispositivos móveis
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: 'environment' } }
          });
        } catch (err) {
          console.log('Falha ao tentar câmera traseira, tentando frontal...');
        }
      }

      // Se não conseguiu a traseira ou não é mobile, tenta qualquer câmera
      if (!stream) {
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

      // Configura o novo stream
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      setHasPermission(true);
      toast.success('Câmera iniciada com sucesso!');
    } catch (err) {
      console.error('Erro ao configurar câmera:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao acessar a câmera');
      setHasPermission(false);
      toast.error('Erro ao acessar câmera. Por favor, verifique as permissões.');
    }
  };

  // Limpa recursos quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Tenta iniciar a câmera quando o componente monta
  useEffect(() => {
    setupCamera();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white text-center p-4 gap-4">
        <p>{error}</p>
        <button
          onClick={() => setupCamera()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white text-center p-4">
        <p>Solicitando acesso à câmera...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white text-center p-4 gap-4">
        <p>Acesso à câmera negado. Por favor, permita o acesso nas configurações do navegador.</p>
        <button
          onClick={() => setupCamera()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

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
