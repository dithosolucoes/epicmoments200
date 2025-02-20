
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `stamps/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stamps')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('stamps')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('stamps').insert({
        name,
        image_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
      toast.success('Estampa enviada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar estampa: ' + error.message);
    },
  });

  const deleteStamp = useMutation({
    mutationFn: async (stampId: string) => {
      const { error } = await supabase.from('stamps').delete().eq('id', stampId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
      toast.success('Estampa excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir estampa: ' + error.message);
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
      toast.success('Nome da estampa atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar nome da estampa: ' + error.message);
    },
  });

  return { stamps, isLoading, uploadStamp, deleteStamp, updateStampName };
};
