import { RefreshCw, Trash2 } from 'lucide-react';
import { useSubscriptions, useDeleteSubscription } from '@/hooks/useSubscriptions';
import { AddSubscriptionDialog } from '../dialogs/AddSubscriptionDialog';
import { usePrivacy } from '@/lib/privacy-context';
import { toast } from 'sonner';

export function SubscriptionsModule() {
  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const deleteSubscription = useDeleteSubscription();
  const { maskCurrency } = usePrivacy();

  const totalMonthly = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription.mutateAsync(id);
      toast.success('Assinatura removida');
    } catch {
      toast.error('Erro ao remover assinatura');
    }
  };

  return (
    <div className="atlas-module">
      <div className="atlas-module-header">
        <div>
          <h3 className="atlas-module-title">
            <RefreshCw className="w-5 h-5 text-atlas-cyan" />
            Assinaturas
          </h3>
          <p className="atlas-module-subtitle">Gastos recorrentes mensais</p>
        </div>
        <AddSubscriptionDialog />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma assinatura</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Adicione seus serviços recorrentes
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-atlas-cyan/10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-atlas-cyan" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{subscription.name}</p>
                    {subscription.billing_day && (
                      <p className="text-xs text-muted-foreground">
                        Dia {subscription.billing_day}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {maskCurrency(subscription.amount)}
                  </span>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total mensal</span>
              <span className="font-display font-bold text-atlas-cyan">
                {maskCurrency(totalMonthly)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
