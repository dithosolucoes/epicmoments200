import { useEffect, useRef } from 'react';

export default function TestCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Função imediata para poder usar async/await
    (async () => {
      try {
        // Tentar obter a câmera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480
          }
        });

        // Se tiver sucesso, conectar ao elemento de vídeo
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
      }
    })();

    // Cleanup
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '20px auto' }}>
      <h1>Teste de Câmera</h1>
      <video 
        ref={videoRef}
        autoPlay 
        playsInline
        style={{ width: '100%', backgroundColor: '#000' }}
      />
    </div>
  );
}
