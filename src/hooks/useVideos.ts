
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Video } from '@/types/database';
import { toast } from 'sonner';

export const useVideos = () => {
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('videos').select('*');
      if (error) throw error;
      return data as Video[];
    },
  });

  const uploadVideo = useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('videos').insert({
        title,
        video_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Vídeo enviado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar vídeo: ' + error.message);
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase.from('videos').delete().eq('id', videoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Vídeo excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir vídeo: ' + error.message);
    },
  });

  const updateVideoTitle = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from('videos')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Título do vídeo atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar título do vídeo: ' + error.message);
    },
  });

  return { videos, isLoading, uploadVideo, deleteVideo, updateVideoTitle };
};
