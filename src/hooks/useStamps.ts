import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Stamp } from '@/types/database';
import { toast } from 'sonner';

export const useStamps = () => {
  const queryClient = useQueryClient();

  const { data: stamps = [], isLoading } = useQuery({
    queryKey: ['stamps'],
    queryFn: async () => {
      console.log('Buscando estampas...');
      const { data, error } = await supabase
        .from('stamps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar estampas:', error);
        throw error;
      }

      console.log('Estampas encontradas:', data);
      return data as Stamp[];
    },
  });

  const uploadStamp = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      try {
        console.log('Iniciando upload da estampa:', { name, fileSize: file.size, fileType: file.type });

        // 1. Upload da imagem original
        const fileExt = file.name.split('.').pop();
        const originalFileName = `original_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        
        console.log('Fazendo upload da imagem original:', originalFileName);
        const { data: originalUpload, error: originalError } = await supabase.storage
          .from('stamps')
          .upload(originalFileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (originalError) {
          console.error('Erro no upload original:', originalError);
          throw new Error(`Erro no upload original: ${originalError.message}`);
        }

        // 2. Obter URL pública da imagem original
        const { data: originalUrlData } = await supabase.storage
          .from('stamps')
          .getPublicUrl(originalFileName);

        if (!originalUrlData?.publicUrl) {
          throw new Error('URL pública da imagem original não encontrada');
        }

        console.log('URL da imagem original:', originalUrlData.publicUrl);

        // 3. Processar imagem para AR
        console.log('Processando imagem para AR...');
        let processedImageUrl;
        try {
          processedImageUrl = await processImageForAR(originalUrlData.publicUrl);
          console.log('Imagem processada com sucesso:', processedImageUrl);
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          // Se falhar o processamento, usa a imagem original
          processedImageUrl = originalUrlData.publicUrl;
        }
        
        // 4. Upload da imagem processada
        const processedFileName = `processed_${originalFileName}`;
        console.log('Fazendo upload da imagem processada:', processedFileName);
        
        let processedUploadUrl = originalUrlData.publicUrl; // fallback para a original
        
        try {
          const processedBlob = await fetch(processedImageUrl).then(res => res.blob());
          const { data: processedUpload, error: processedError } = await supabase.storage
            .from('stamps')
            .upload(processedFileName, processedBlob, {
              cacheControl: '3600',
              upsert: false
            });

          if (processedError) {
            throw processedError;
          }

          // 5. Obter URL pública da imagem processada
          const { data: processedUrlData } = await supabase.storage
            .from('stamps')
            .getPublicUrl(processedFileName);

          if (processedUrlData?.publicUrl) {
            processedUploadUrl = processedUrlData.publicUrl;
          }
        } catch (error) {
          console.error('Erro no upload da imagem processada:', error);
          // Continua usando a URL original como fallback
        }

        // 6. Inserir no banco
        console.log('Inserindo no banco...', {
          name,
          image_url: originalUrlData.publicUrl,
          processed_image_url: processedUploadUrl
        });

        const { data: insertData, error: insertError } = await supabase
          .from('stamps')
          .insert({
            name,
            image_url: originalUrlData.publicUrl,
            processed_image_url: processedUploadUrl
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro na inserção:', insertError);
          throw new Error(`Erro na inserção: ${insertError.message}`);
        }

        console.log('Upload completo:', insertData);
        return insertData;
      } catch (error) {
        console.error('Erro completo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
      toast.success('Estampa enviada com sucesso!');
    },
    onError: (error: Error) => {
      console.error('Erro no mutation:', error);
      toast.error('Erro ao enviar estampa: ' + error.message);
    },
  });

  const deleteStamp = useMutation({
    mutationFn: async (id: string) => {
      const stamp = stamps.find(s => s.id === id);
      if (!stamp) throw new Error('Estampa não encontrada');

      // Remove os arquivos do storage
      const originalFileName = stamp.image_url.split('/').pop();
      const processedFileName = stamp.processed_image_url.split('/').pop();

      if (originalFileName && processedFileName) {
        const { error: storageError } = await supabase.storage
          .from('stamps')
          .remove([originalFileName, processedFileName]);

        if (storageError) throw storageError;
      }

      // Remove do banco
      const { error: dbError } = await supabase
        .from('stamps')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
      toast.success('Estampa removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao remover estampa: ' + error.message);
    },
  });

  const updateStampName = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('stamps')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
      toast.success('Nome atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar nome: ' + error.message);
    },
  });

  return {
    stamps,
    isLoading,
    uploadStamp,
    deleteStamp,
    updateStampName,
  };
};
