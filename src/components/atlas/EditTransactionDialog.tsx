import { useState, useEffect } from 'react';
import { useUpdateTransaction, useDeleteTransaction, Transaction } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({ transaction, open, onOpenChange }: EditTransactionDialogProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: categories = [] } = useCategories();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description || '');
      setCategoryId(transaction.category_id || '');
      setDate(transaction.date);
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        type,
        amount: parseFloat(amount),
        description: description || null,
        category_id: categoryId || null,
        date,
      });

      toast.success('✔️ Transação atualizada');
      onOpenChange(false);
    } catch {
      toast.error('Erro ao atualizar transação');
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      toast.success('🗑 Transação removida');
      setConfirmDelete(false);
      onOpenChange(false);
    } catch {
      toast.error('Erro ao excluir transação');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Editar Transação</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                  type === 'income'
                    ? 'border-atlas-income bg-atlas-income/10 text-atlas-income-light'
                    : 'border-border hover:border-border/80 text-muted-foreground'
                )}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Receita</span>
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                  type === 'expense'
                    ? 'border-atlas-expense bg-atlas-expense/10 text-atlas-expense-light'
                    : 'border-border hover:border-border/80 text-muted-foreground'
                )}
              >
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">Despesa</span>
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Valor</label>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 transition-all duration-150 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <span className="text-lg font-medium text-muted-foreground/60 select-none">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className="w-full bg-transparent text-[28px] font-semibold tracking-[0.02em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Descrição (opcional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado"
                className="atlas-input"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Categoria</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="atlas-input">
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="atlas-input" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
              <button
                type="submit"
                disabled={updateTransaction.isPending}
                className="atlas-btn-primary w-full"
              >
                {updateTransaction.isPending ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir esta transação?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
