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

  // Obter dados da imagem
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 1. Converter para escala de cinza e aumentar contraste
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Converter para escala de cinza
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Aumentar contraste
    const contrast = 1.8; // Aumentado para melhor detecção
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
    
    data[i] = newGray;
    data[i + 1] = newGray;
    data[i + 2] = newGray;
  }

  // 2. Aplicar detecção de bordas (Operador Sobel)
  const edges = new Uint8ClampedArray(data.length);
  const width = canvas.width;
  
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Kernel Sobel horizontal
      const gx = 
        -1 * data[idx - width * 4 - 4] +
        -2 * data[idx - 4] +
        -1 * data[idx + width * 4 - 4] +
        1 * data[idx - width * 4 + 4] +
        2 * data[idx + 4] +
        1 * data[idx + width * 4 + 4];
      
      // Kernel Sobel vertical
      const gy = 
        -1 * data[idx - width * 4 - 4] +
        -2 * data[idx - width * 4] +
        -1 * data[idx - width * 4 + 4] +
        1 * data[idx + width * 4 - 4] +
        2 * data[idx + width * 4] +
        1 * data[idx + width * 4 + 4];
      
      // Magnitude do gradiente
      const g = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      
      edges[idx] = g;
      edges[idx + 1] = g;
      edges[idx + 2] = g;
      edges[idx + 3] = 255;
    }
  }

  // 3. Combinar imagem original com bordas
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 0.7 + edges[i] * 0.3);
    data[i + 1] = Math.min(255, data[i + 1] * 0.7 + edges[i + 1] * 0.3);
    data[i + 2] = Math.min(255, data[i + 2] * 0.7 + edges[i + 2] * 0.3);
  }

  // Aplicar as mudanças no canvas
  ctx.putImageData(imageData, 0, 0);

  // Retornar imagem processada como data URL
  return canvas.toDataURL('image/png');
}
