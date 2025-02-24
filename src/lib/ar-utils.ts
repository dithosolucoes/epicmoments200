export async function processImageForAR(imageUrl: string): Promise<string> {
  try {
    console.log('Iniciando processamento da imagem:', imageUrl);
    
    // Carregar a imagem
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = (error) => {
        console.error('Erro ao carregar imagem:', error);
        reject(new Error('Falha ao carregar imagem'));
      };
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
      const contrast = 1.5; // Reduzido um pouco para evitar muito ruído
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
        
        // Kernel Sobel
        const gx = 
          -1 * data[idx - width * 4 - 4] +
          -2 * data[idx - width * 4] +
          -1 * data[idx - width * 4 + 4] +
          1 * data[idx + width * 4 - 4] +
          2 * data[idx + width * 4] +
          1 * data[idx + width * 4 + 4];
          
        const gy = 
          -1 * data[idx - width * 4 - 4] +
          -2 * data[idx - 4] +
          -1 * data[idx + width * 4 - 4] +
          1 * data[idx - width * 4 + 4] +
          2 * data[idx + 4] +
          1 * data[idx + width * 4 + 4];
          
        const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        
        edges[idx] = magnitude;
        edges[idx + 1] = magnitude;
        edges[idx + 2] = magnitude;
        edges[idx + 3] = 255;
      }
    }

    // 3. Combinar imagem original com bordas detectadas
    for (let i = 0; i < data.length; i += 4) {
      const weight = 0.7; // 70% original, 30% bordas
      data[i] = weight * data[i] + (1 - weight) * edges[i];
      data[i + 1] = weight * data[i + 1] + (1 - weight) * edges[i + 1];
      data[i + 2] = weight * data[i + 2] + (1 - weight) * edges[i + 2];
    }

    // Aplicar as alterações no canvas
    ctx.putImageData(imageData, 0, 0);

    // Converter para URL de dados
    const processedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    console.log('Processamento de imagem concluído com sucesso');
    
    return processedImageUrl;
  } catch (error) {
    console.error('Erro no processamento da imagem:', error);
    throw error;
  }
}
