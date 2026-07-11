import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Database } from '@/integrations/supabase/types';

export type InvestmentAsset = Database['public']['Tables']['investment_assets']['Row'];
export type InvestmentAssetInsert = Database['public']['Tables']['investment_assets']['Insert'];
export type InvestmentAssetUpdate = Database['public']['Tables']['investment_assets']['Update'];

export type InvestmentMovement = Database['public']['Tables']['investment_movements']['Row'];
export type InvestmentMovementInsert = Database['public']['Tables']['investment_movements']['Insert'];

export function useInvestmentAssets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['investment_assets', user?.id],
    queryFn: async () => {
      if (!user) return [] as InvestmentAsset[];
      const { data, error } = await supabase
        .from('investment_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as InvestmentAsset[];
    },
    enabled: !!user,
  });
}

export function useInvestmentMovements(assetId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['investment_movements', user?.id, assetId ?? 'all'],
    queryFn: async () => {
      if (!user) return [] as InvestmentMovement[];
      let q = supabase
        .from('investment_movements')
        .select('*')
        .eq('user_id', user.id)
        .order('movement_date', { ascending: false });
      if (assetId) q = q.eq('asset_id', assetId);
      const { data, error } = await q;
      if (error) throw error;
      return data as InvestmentMovement[];
    },
    enabled: !!user,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: Omit<InvestmentAssetInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('investment_assets')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investment_assets'] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: InvestmentAssetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('investment_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investment_assets'] }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investment_assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['investment_assets'] });
      qc.invalidateQueries({ queryKey: ['investment_movements'] });
    },
  });
}

export function useCreateMovement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (payload: Omit<InvestmentMovementInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('investment_movements')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investment_movements'] }),
  });
}

export function useDeleteMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investment_movements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['investment_movements'] }),
  });
}