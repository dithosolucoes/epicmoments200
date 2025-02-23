import { useCallback, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { createWorker } from 'tesseract.js';
import { supabase } from '@/lib/supabase';

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

  // Inicializa os modelos necessários
  useEffect(() => {
    const initModels = async () => {
      // Carrega o modelo do TensorFlow.js para detecção de objetos
      modelRef.current = await blazeface.load();
      
      // Inicializa o Tesseract.js para OCR
      workerRef.current = await createWorker('por');
    };

    initModels();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const detectStamps = useCallback(async (imageData: ImageData): Promise<DetectedStamp[]> => {
    if (processingRef.current || !modelRef.current || !workerRef.current) return [];
    processingRef.current = true;

    try {
      // 1. Converte ImageData para tensor
      const tensor = tf.browser.fromPixels(imageData);
      
      // 2. Normaliza a imagem
      const normalized = tf.div(tensor, 255);
      
      // 3. Detecta objetos na imagem
      const predictions = await modelRef.current.estimateFaces(normalized, false);
      
      // 4. Para cada região detectada, tenta fazer OCR
      const detectedStamps: DetectedStamp[] = [];
      
      for (const pred of predictions) {
        const { topLeft, bottomRight } = pred;
        const [x, y] = topLeft;
        const [x2, y2] = bottomRight;
        
        // Extrai a região da imagem
        const width = x2 - x;
        const height = y2 - y;
        
        // Faz OCR na região
        const { data: { text } } = await workerRef.current.recognize(imageData, {
          rectangle: { left: x, top: y, width, height }
        });
        
        // Verifica se o texto detectado corresponde a alguma estampa no banco
        const { data: stamps } = await supabase
          .from('stamps')
          .select('id, name')
          .ilike('name', `%${text}%`)
          .limit(1);
        
        if (stamps && stamps.length > 0) {
          detectedStamps.push({
            id: stamps[0].id,
            confidence: pred.probability[0],
            boundingBox: {
              x: x,
              y: y,
              width: width,
              height: height
            }
          });
        }
      }

      return detectedStamps;
    } catch (error) {
      console.error('Erro na detecção de estampas:', error);
      return [];
    } finally {
      // Limpa os tensores para evitar memory leak
      tf.dispose();
      processingRef.current = false;
    }
  }, []);

  const drawDetections = useCallback((
    ctx: CanvasRenderingContext2D,
    detections: DetectedStamp[]
  ) => {
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
  }, []);

  return { detectStamps, drawDetections };
}
