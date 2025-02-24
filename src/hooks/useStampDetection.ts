import { useCallback, useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { createWorker } from 'tesseract.js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DetectedStamp {
  id: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function useStampDetection() {
  const processingRef = useRef(false);
  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);

  // Inicializa os modelos necessários
  useEffect(() => {
    const initModels = async () => {
      try {
        setIsModelLoading(true);
        console.log('Iniciando carregamento dos modelos...');

        // Carrega o modelo do TensorFlow.js para detecção de objetos
        console.log('Carregando modelo BlazeFace...');
        modelRef.current = await blazeface.load();
        console.log('Modelo BlazeFace carregado com sucesso!');
        
        // Inicializa o Tesseract.js para OCR
        console.log('Inicializando Tesseract...');
        workerRef.current = await createWorker('por');
        console.log('Tesseract inicializado com sucesso!');

        setIsModelLoading(false);
        toast.success('Modelos de detecção carregados!');
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
        toast.error('Erro ao carregar modelos de detecção');
        setIsModelLoading(false);
      }
    };

    initModels();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const detectStamps = useCallback(async (imageData: ImageData): Promise<DetectedStamp[]> => {
    if (processingRef.current || !modelRef.current || !workerRef.current || isModelLoading) {
      console.log('Pulando detecção:', {
        isProcessing: processingRef.current,
        hasModel: !!modelRef.current,
        hasWorker: !!workerRef.current,
        isModelLoading
      });
      return [];
    }

    processingRef.current = true;
    console.log('Iniciando detecção de estampas...');

    try {
      // 1. Converte ImageData para tensor e processa
      console.log('Processando imagem...');
      const processedImageUrl = await processImageForAR(imageData);
      const processedImage = await createImageBitmap(await fetch(processedImageUrl).then(r => r.blob()));
      
      const canvas = document.createElement('canvas');
      canvas.width = processedImage.width;
      canvas.height = processedImage.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível criar contexto 2D');
      
      ctx.drawImage(processedImage, 0, 0);
      const processedData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const tensor = tf.browser.fromPixels(processedData);
      const normalized = tf.div(tensor, 255);
      
      // 2. Detecta objetos na imagem processada
      console.log('Detectando objetos...');
      const predictions = await modelRef.current.estimateFaces(normalized, false);
      console.log(`Encontrados ${predictions.length} objetos`);
      
      // 3. Para cada região detectada, tenta fazer OCR em uma área reduzida
      const detectedStamps: DetectedStamp[] = [];
      
      for (const pred of predictions) {
        const { topLeft, bottomRight, probability } = pred;
        const [x, y] = topLeft;
        const [x2, y2] = bottomRight;
        
        // Reduz a área de OCR em 20% para focar no centro
        const margin = 0.2;
        const width = x2 - x;
        const height = y2 - y;
        const adjustedX = x + width * margin;
        const adjustedY = y + height * margin;
        const adjustedWidth = width * (1 - margin * 2);
        const adjustedHeight = height * (1 - margin * 2);
        
        console.log('Analisando região ajustada:', { 
          x: adjustedX, 
          y: adjustedY, 
          width: adjustedWidth, 
          height: adjustedHeight,
          confidence: probability[0]
        });
        
        // Faz OCR na região reduzida
        console.log('Iniciando OCR na região...');
        const { data: { text } } = await workerRef.current.recognize(imageData, {
          rectangle: { 
            left: adjustedX, 
            top: adjustedY, 
            width: adjustedWidth, 
            height: adjustedHeight 
          }
        });
        console.log('Texto detectado:', text);
        
        if (!text.trim()) continue; // Pula se não encontrou texto
        
        // Verifica se o texto detectado corresponde a alguma estampa no banco
        console.log('Consultando banco de dados...');
        const { data: stamps, error } = await supabase
          .from('stamps')
          .select('id, name, processed_image_url')
          .ilike('name', `%${text}%`)
          .limit(1);

        if (error) {
          console.error('Erro ao consultar banco:', error);
          continue;
        }
        
        if (stamps && stamps.length > 0) {
          console.log('Estampa encontrada:', stamps[0]);
          detectedStamps.push({
            id: stamps[0].id,
            confidence: probability[0],
            boundingBox: {
              x: adjustedX,
              y: adjustedY,
              width: adjustedWidth,
              height: adjustedHeight
            }
          });
        }
      }

      console.log(`Detecção finalizada. ${detectedStamps.length} estampas encontradas.`);
      return detectedStamps;
    } catch (error) {
      console.error('Erro na detecção de estampas:', error);
      return [];
    } finally {
      // Limpa os tensores para evitar memory leak
      tf.dispose();
      processingRef.current = false;
    }
  }, [isModelLoading]);

  const drawDetections = useCallback((
    ctx: CanvasRenderingContext2D,
    detections: DetectedStamp[]
  ) => {
    // Salva o estado atual do contexto
    ctx.save();
    
    // Configura o estilo
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';

    detections.forEach(detection => {
      const { x, y, width, height } = detection.boundingBox;
      
      // Desenha o retângulo
      ctx.strokeRect(x, y, width, height);
      ctx.fillRect(x, y, width, height);
      
      // Desenha o texto com a confiança
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px Arial';
      ctx.fillText(
        `${Math.round(detection.confidence * 100)}%`,
        x,
        y > 20 ? y - 5 : y + height + 20
      );
    });

    // Restaura o estado original do contexto
    ctx.restore();
  }, []);

  return { detectStamps, drawDetections, isModelLoading };
}
