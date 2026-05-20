import { CreditCard, Trash2 } from 'lucide-react';
import { useInstallments, useDeleteInstallment, useUpdateInstallment } from '@/hooks/useInstallments';
import { AddInstallmentDialog } from '../dialogs/AddInstallmentDialog';
import { usePrivacy } from '@/lib/privacy-context';
import { toast } from 'sonner';

export function InstallmentsModule() {
  const { data: installments = [], isLoading } = useInstallments();
  const deleteInstallment = useDeleteInstallment();
  const updateInstallment = useUpdateInstallment();
  const { maskCurrency } = usePrivacy();

  const activeInstallments = installments.filter(
    (i) => i.current_installment <= i.total_installments
  );

  const totalRemaining = activeInstallments.reduce((sum, i) => {
    const remaining = (i.total_installments - i.current_installment + 1) * i.installment_amount;
    return sum + remaining;
  }, 0);

  const handleDelete = async (id: string) => {
    try {
      await deleteInstallment.mutateAsync(id);
      toast.success('Parcela removida');
    } catch {
      toast.error('Erro ao remover parcela');
    }
  };

  const handleAdvance = async (installment: typeof installments[0]) => {
    if (installment.current_installment >= installment.total_installments) {
      toast.info('Todas as parcelas foram pagas!');
      return;
    }
    try {
      await updateInstallment.mutateAsync({
        id: installment.id,
        current_installment: installment.current_installment + 1,
      });
      toast.success('Parcela avançada!');
    } catch {
      toast.error('Erro ao avançar parcela');
    }
  };

  return (
    <div className="atlas-module">
      <div className="atlas-module-header">
        <div>
          <h3 className="atlas-module-title">
            <CreditCard className="w-5 h-5 text-atlas-purple" />
            Parcelas
          </h3>
          <p className="atlas-module-subtitle">Compras parceladas ativas</p>
        </div>
        <AddInstallmentDialog />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : activeInstallments.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhuma parcela ativa</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Adicione suas compras parceladas
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {activeInstallments.slice(0, 4).map((installment) => {
              const progress = (installment.current_installment / installment.total_installments) * 100;
              const remaining = (installment.total_installments - installment.current_installment + 1) * installment.installment_amount;

              return (
                <div
                  key={installment.id}
                  className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{installment.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {maskCurrency(installment.installment_amount)}/mês
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdvance(installment)}
                        className="atlas-badge bg-atlas-purple/15 text-atlas-purple hover:bg-atlas-purple/25 cursor-pointer transition-colors"
                      >
                        {installment.current_installment}/{installment.total_installments}
                      </button>
                      <button
                        onClick={() => handleDelete(installment.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="atlas-installment-progress mb-2">
                    <div
                      className="atlas-installment-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Restante: {maskCurrency(remaining)}</span>
                    <span>Total: {maskCurrency(installment.total_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {activeInstallments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total restante</span>
                <span className="font-display font-bold text-atlas-purple">
                  {maskCurrency(totalRemaining)}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
