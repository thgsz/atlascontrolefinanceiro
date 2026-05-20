import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useAddRecurringExpense } from '@/hooks/useRecurringExpenses';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

export function AddRecurringExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  
  const addExpense = useAddRecurringExpense();
  const { data: categories = [] } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    const dayValue = dayOfMonth ? parseInt(dayOfMonth) : null;
    
    if (!name || isNaN(amountValue) || amountValue <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    try {
      await addExpense.mutateAsync({
        name,
        amount: amountValue,
        day_of_month: dayValue,
        category_id: categoryId || null,
        is_active: true,
      });
      
      toast.success('Despesa recorrente adicionada!');
      setOpen(false);
      setName('');
      setAmount('');
      setDayOfMonth('');
      setCategoryId('');
    } catch {
      toast.error('Erro ao adicionar despesa');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="atlas-btn-ghost p-2 rounded-lg">
          <Plus className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="atlas-card border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display">Nova Despesa Recorrente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Nome da Despesa
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aluguel, Internet"
              className="atlas-input w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Valor Mensal (R$)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                step="0.01"
                min="0"
                className="atlas-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Dia do Vencimento
              </label>
              <input
                type="number"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="Opcional"
                min="1"
                max="31"
                className="atlas-input w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Categoria (opcional)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="atlas-input w-full"
            >
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={addExpense.isPending}
            className="atlas-btn-primary w-full"
          >
            {addExpense.isPending ? 'Salvando...' : 'Adicionar Despesa'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
