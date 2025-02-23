import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      console.log('Iniciando configuração da câmera...');
      
      try {
        console.log('Solicitando permissão da câmera...');
        
        // Primeiro tenta a câmera traseira
        try {
          console.log('Tentando câmera traseira...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: 'environment' } }
          });
          console.log('Câmera traseira conectada com sucesso!');
        } catch (err) {
          // Se falhar, tenta qualquer câmera
          console.log('Falha na câmera traseira, tentando qualquer câmera...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          console.log('Câmera alternativa conectada com sucesso!');
        }

        if (!videoRef.current) {
          throw new Error('Elemento de vídeo não encontrado');
        }

        console.log('Configurando stream no elemento de vídeo...');
        videoRef.current.srcObject = stream;
        
        // Adiciona listeners para debug
        videoRef.current.onloadedmetadata = () => {
          console.log('Metadados do vídeo carregados');
          if (videoRef.current) {
            console.log(`Dimensões do vídeo: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          }
        };

        videoRef.current.onplay = () => {
          console.log('Vídeo começou a reproduzir');
        };

        videoRef.current.oncanplay = () => {
          console.log('Vídeo pode ser reproduzido');
        };

        videoRef.current.onerror = (e) => {
          console.error('Erro no elemento de vídeo:', e);
        };

        await videoRef.current.play();
        console.log('Play() chamado no elemento de vídeo');
        
        setHasPermission(true);
        toast.success('Câmera iniciada com sucesso!');
      } catch (error) {
        console.error('Erro detalhado ao acessar câmera:', error);
        setHasPermission(false);
        toast.error('Erro ao acessar câmera. Por favor, permita o acesso.');
      }
    }

    setupCamera();

    return () => {
      console.log('Limpando recursos da câmera...');
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Track da câmera parado:', track.label);
        });
      }
    };
  }, []);

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white text-center p-4">
        <p>Solicitando acesso à câmera...</p>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white text-center p-4">
        <p>Acesso à câmera negado. Por favor, permita o acesso e recarregue a página.</p>
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
