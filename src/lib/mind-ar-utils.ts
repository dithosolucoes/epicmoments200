export async function processImageForMindAR(imageUrl: string): Promise<ArrayBuffer> {
  // Carregar a imagem
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  // Converter para ArrayBuffer
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

export async function initMindAR(container: HTMLElement, imageData: ArrayBuffer) {
  // Esperar o script do MindAR carregar
  if (!(window as any).MINDAR?.IMAGE) {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image.prod.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  // Inicializar MindAR
  const mindar = new (window as any).MINDAR.IMAGE({
    container: container,
    imageTargetSrc: imageData,
  });

  await mindar.start();
  return mindar;
}
