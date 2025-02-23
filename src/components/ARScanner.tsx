import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Camera as CameraIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Camera } from './Camera';

export default function ARScanner() {
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verifica se estamos em um contexto seguro (HTTPS)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      toast.error('Esta funcionalidade requer uma conexão segura (HTTPS)');
    }
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      // Verifica suporte do navegador
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      setIsStarted(true);
    } catch (err) {
      console.error('Erro ao iniciar câmera:', err);
      toast.error('Erro ao iniciar câmera. Por favor, verifique as permissões do navegador.');
      setIsStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    setIsStarted(false);
  };

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
          <Camera />
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
