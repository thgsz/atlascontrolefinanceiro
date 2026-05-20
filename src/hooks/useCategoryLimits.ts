import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export interface CategoryLimit {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
}

export function useCategoryLimits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['category_limits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('category_limits')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as CategoryLimit[];
    },
    enabled: !!user,
  });
}

export function useUpsertCategoryLimit() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ category_id, monthly_limit }: { category_id: string; monthly_limit: number }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('category_limits')
        .upsert(
          { user_id: user.id, category_id, monthly_limit, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,category_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category_limits'] });
    },
  });
}

export function useDeleteCategoryLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('category_limits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category_limits'] });
    },
  });
}
