import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Stamp } from '@/types/database';
import { toast } from 'sonner';

export const useStamps = () => {
  const queryClient = useQueryClient();

  const { data: stamps = [], isLoading } = useQuery({
    queryKey: ['stamps'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stamps').select('*');
      if (error) throw error;
      return data as Stamp[];
    },
  });

  const uploadStamp = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      try {
        console.log('Iniciando upload da estampa:', { name, fileSize: file.size, fileType: file.type });

        // 1. Upload do arquivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `stamps/${fileName}`;

        console.log('Fazendo upload para:', filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('stamps')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }

        console.log('Upload concluído:', uploadData);

        // 2. Obtém a URL pública
        const { data: urlData, error: urlError } = await supabase.storage
          .from('stamps')
          .getPublicUrl(filePath);

        if (urlError) {
          console.error('Erro ao obter URL:', urlError);
          throw new Error(`Erro ao obter URL: ${urlError.message}`);
        }

        console.log('URL obtida:', urlData);

        // 3. Insere no banco
        const { data: insertData, error: insertError } = await supabase
          .from('stamps')
          .insert({
            name,
            image_url: urlData.publicUrl,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro na inserção:', insertError);
          throw new Error(`Erro na inserção: ${insertError.message}`);
        }

        console.log('Inserção concluída:', insertData);
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

      // Remove o arquivo do storage
      const fileName = stamp.image_url.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('stamps')
          .remove([`stamps/${fileName}`]);

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
