import { useState } from 'react';
import { useAddTransaction } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddTransactionDialogProps {
  variant?: 'default' | 'fab' | 'icon';
}

export function AddTransactionDialog({ variant = 'default' }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: categories = [] } = useCategories();
  const addTransaction = useAddTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    try {
      await addTransaction.mutateAsync({
        type,
        amount: parseFloat(amount),
        description: description || null,
        category_id: categoryId || null,
        date,
        is_recurring: false,
      });

      toast.success('Transação adicionada!');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao adicionar transação');
    }
  };

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'fab' ? (
          <button className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform duration-200 hover:scale-105 active:scale-95 bg-primary text-primary-foreground">
            <Plus className="w-6 h-6" />
          </button>
        ) : variant === 'icon' ? (
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-95"
            title="Nova Transação"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button className="atlas-btn-primary">
            <Plus className="w-5 h-5" />
            Nova Transação
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-card border-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nova Transação</DialogTitle>
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
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Valor
            </label>
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
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Descrição (opcional)
            </label>
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
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="atlas-input"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="atlas-input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={addTransaction.isPending}
            className="atlas-btn-primary w-full"
          >
            {addTransaction.isPending ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
