import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Camera as CameraIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Camera } from './Camera';

export default function ARScanner() {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Verifica se estamos em um contexto seguro (HTTPS)
  useEffect(() => {
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      toast.error('Esta funcionalidade requer uma conexão segura (HTTPS)');
    }
  }, []);

  const requestCameraPermission = async () => {
    try {
      // Primeiro, verifica se já temos permissão
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permission.state === 'denied') {
        toast.error('Permissão da câmera foi negada. Por favor, redefina as permissões do site nas configurações do navegador.');
        return false;
      }

      // Se a permissão não foi concedida ainda, solicita
      if (permission.state === 'prompt') {
        // Tenta obter acesso à câmera para disparar o prompt de permissão
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Limpa o stream de teste
      }

      return true;
    } catch (err) {
      console.error('Erro ao verificar permissão:', err);
      return false;
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    try {
      // Verifica suporte do navegador
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Verifica e solicita permissão
      const permitted = await requestCameraPermission();
      if (!permitted) {
        throw new Error('Permissão da câmera negada');
      }

      setHasPermission(true);
      setIsStarted(true);
    } catch (err) {
      console.error('Erro ao iniciar câmera:', err);
      toast.error('Erro ao iniciar câmera. Por favor, verifique as permissões do navegador.');
      setHasPermission(false);
      setIsStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    setIsStarted(false);
    setHasPermission(null);
  };

  // Se a permissão foi negada, mostra mensagem de erro
  if (hasPermission === false) {
    return (
      <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4 text-white">
          <p>Acesso à câmera negado. Por favor, permita o acesso nas configurações do navegador.</p>
          <Button
            onClick={startCamera}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
      {!isStarted ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-4">
          <CameraIcon className="w-12 h-12 text-white" />
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={startCamera}
              disabled={isLoading}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CameraIcon className="w-4 h-4" />
              {isLoading ? 'Iniciando...' : 'Iniciar Câmera'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <Camera onError={() => setIsStarted(false)} />
          <Button
            onClick={stopCamera}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white"
          >
            Parar Câmera
          </Button>
        </div>
      )}
    </div>
  );
}
