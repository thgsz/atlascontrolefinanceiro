import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';

export interface RecurringExpense {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  amount: number;
  day_of_month: number | null;
  is_active: boolean;
  created_at: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export function useRecurringExpenses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`recurring-expenses-changes-${user.id}-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_expenses',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ['recurring-expenses', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('recurring_expenses')
        .select(`
          *,
          category:categories(id, name, icon, color)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('day_of_month');

      if (error) throw error;
      return data as RecurringExpense[];
    },
    enabled: !!user,
  });
}

export function useAddRecurringExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (expense: Omit<RecurringExpense, 'id' | 'user_id' | 'created_at' | 'category'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_expenses')
        .insert({ ...expense, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
    },
  });
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] });
    },
  });
}
