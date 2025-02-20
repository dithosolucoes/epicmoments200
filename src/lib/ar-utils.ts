export async function processImageForAR(imageUrl: string): Promise<string> {
  // Carregar a imagem
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });

  // Criar canvas para processamento
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível criar contexto 2D');

  // Desenhar imagem no canvas
  ctx.drawImage(img, 0, 0);

  // Processar imagem para melhorar detecção
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Aumentar contraste e converter para escala de cinza
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Converter para escala de cinza
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Aumentar contraste
    const contrast = 1.5; // Fator de contraste
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const newGray = factor * (gray - 128) + 128;
    
    data[i] = newGray;
    data[i + 1] = newGray;
    data[i + 2] = newGray;
  }

  ctx.putImageData(imageData, 0, 0);

  // Retornar imagem processada como data URL
  return canvas.toDataURL('image/png');
}
