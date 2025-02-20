import { useEffect, useRef, useState } from 'react';
import { useAssociations } from '@/hooks/useAssociations';
import { toast } from 'sonner';
import { Loader2, Camera } from 'lucide-react';
import { processImageForMindAR, initMindAR } from '@/lib/mind-ar-utils';

export default function ARScanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Iniciando scanner...');
  const { associations } = useAssociations();

  useEffect(() => {
    let mounted = true;
    let mindarInstance: any = null;

    async function initializeAR() {
      try {
        if (!associations.length || !associations[0]?.stamp?.image_url) {
          toast.error('Nenhuma estampa encontrada');
          setIsLoading(false);
          return;
        }

        setLoadingText('Processando estampa...');
        const imageData = await processImageForMindAR(associations[0].stamp.image_url);

        if (!mounted || !containerRef.current) return;

        setLoadingText('Inicializando reconhecimento...');
        mindarInstance = await initMindAR(containerRef.current, imageData, associations[0].video.url);

        setIsLoading(false);
        toast.success('Scanner pronto!');
      } catch (err) {
        console.error('Erro:', err);
        toast.error('Erro ao inicializar scanner');
        setIsLoading(false);
      }
    }

    initializeAR();

    return () => {
      mounted = false;
      if (mindarInstance) {
        mindarInstance.stop();
      }
    };
  }, [associations]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-100 rounded-lg">
        <Loader2 className="w-12 h-12 animate-spin text-epic-blue mb-4" />
        <p className="text-lg font-medium text-epic-blue mb-2">{loadingText}</p>
        <p className="text-sm text-muted-foreground">Por favor, aguarde...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full min-h-[400px] bg-black rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm z-10">
        <p className="text-sm text-center flex items-center justify-center gap-2">
          <Camera className="w-4 h-4" />
          Aponte a câmera para uma estampa registrada
        </p>
      </div>
    </div>
  );
}
