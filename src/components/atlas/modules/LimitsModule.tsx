import { useMemo } from 'react';
import { Gauge, AlertTriangle, Trash2 } from 'lucide-react';
import { useCategoryLimits, useDeleteCategoryLimit } from '@/hooks/useCategoryLimits';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { AddLimitDialog } from '../dialogs/AddLimitDialog';
import { usePrivacy } from '@/lib/privacy-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LimitsModuleProps {
  month: number;
  year: number;
}

export function LimitsModule({ month, year }: LimitsModuleProps) {
  const { data: limits = [], isLoading: limitsLoading } = useCategoryLimits();
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions(month, year);
  const deleteLimit = useDeleteCategoryLimit();
  const { maskCurrency } = usePrivacy();

  const limitsWithSpending = useMemo(() => {
    return limits.map((limit) => {
      const category = categories.find((c) => c.id === limit.category_id);
      const spent = transactions
        .filter((t) => t.type === 'expense' && t.category_id === limit.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const percentage = (spent / limit.monthly_limit) * 100;
      const status = percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'danger' : percentage >= 80 ? 'warning' : 'normal';
      return { ...limit, category, spent, percentage: Math.min(percentage, 100), rawPercentage: percentage, status };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [limits, categories, transactions]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLimit.mutateAsync(id);
      toast.success('Limite removido');
    } catch {
      toast.error('Erro ao remover limite');
    }
  };

  const existingCategoryIds = limits.map((l) => l.category_id);
  const isLoading = limitsLoading;

  return (
    <div className="atlas-module">
      <div className="atlas-module-header">
        <div>
          <h3 className="atlas-module-title">
            <Gauge className="w-5 h-5 text-atlas-orange" />
            Limites
          </h3>
          <p className="atlas-module-subtitle">Controle de gastos por categoria</p>
        </div>
        <AddLimitDialog existingCategoryIds={existingCategoryIds} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : limitsWithSpending.length === 0 ? (
        <div className="text-center py-8">
          <Gauge className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhum limite definido</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Defina limites para controlar seus gastos
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {limitsWithSpending.map((limit) => (
            <div
              key={limit.id}
              className={cn(
                'p-4 rounded-xl transition-all group',
                limit.status === 'exceeded' && 'bg-destructive/10 border border-destructive/30',
                limit.status === 'danger' && 'bg-atlas-expense/10 border border-atlas-expense/20',
                limit.status === 'warning' && 'bg-atlas-orange/10 border border-atlas-orange/20',
                limit.status === 'normal' && 'bg-secondary/30'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: limit.category?.color || '#6b7280' }}
                  />
                  <span className="font-medium text-sm">
                    {limit.category?.name || 'Categoria'}
                  </span>
                  {limit.status !== 'normal' && (
                    <AlertTriangle
                      className={cn(
                        'w-4 h-4',
                        limit.status === 'exceeded' ? 'text-destructive' :
                        limit.status === 'danger' ? 'text-atlas-expense' : 'text-atlas-orange'
                      )}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      limit.status === 'exceeded' && 'text-destructive',
                      limit.status === 'danger' && 'text-atlas-expense',
                      limit.status === 'warning' && 'text-atlas-orange',
                      limit.status === 'normal' && 'text-foreground'
                    )}
                  >
                    {limit.rawPercentage.toFixed(0)}%
                  </span>
                  <button
                    onClick={() => handleDelete(limit.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="atlas-progress mb-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    limit.status === 'exceeded' && 'bg-destructive',
                    limit.status === 'danger' && 'atlas-progress-bar-danger',
                    limit.status === 'warning' && 'atlas-progress-bar-warning',
                    limit.status === 'normal' && 'atlas-progress-bar'
                  )}
                  style={{ width: `${limit.percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{maskCurrency(limit.spent)} gastos</span>
                <span>Limite: {maskCurrency(limit.monthly_limit)}</span>
              </div>

              {limit.status === 'exceeded' && (
                <p className="text-xs text-destructive mt-2 font-medium">
                  ⚠️ Limite excedido em {maskCurrency(limit.spent - limit.monthly_limit)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
