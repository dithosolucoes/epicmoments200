
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Association } from '@/types/database';
import { toast } from 'sonner';

export const useAssociations = () => {
  const queryClient = useQueryClient();

  const { data: associations = [], isLoading } = useQuery({
    queryKey: ['associations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('associations')
          .select('*, stamp:stamps(*), video:videos(*)');
        
        if (error) throw error;
        return data as Association[];
      } catch (error) {
        console.error('Error fetching associations:', error);
        return [];
      }
    },
  });

  const createAssociation = useMutation({
    mutationFn: async ({ stampId, videoId }: { stampId: string; videoId: string }) => {
      try {
        const { error } = await supabase
          .from('associations')
          .insert({ stamp_id: stampId, video_id: videoId });
        
        if (error) throw error;
      } catch (error) {
        console.error('Error creating association:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      toast.success('Associação criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar associação: ' + error.message);
    },
  });

  const deleteAssociation = useMutation({
    mutationFn: async (associationId: string) => {
      const { error } = await supabase
        .from('associations')
        .delete()
        .eq('id', associationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      toast.success('Associação excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir associação: ' + error.message);
    },
  });

  return { associations, isLoading, createAssociation, deleteAssociation };
};
