import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useCreateInstallment } from '@/hooks/useInstallments';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

export function AddInstallmentDialog() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  
  const createInstallment = useCreateInstallment();
  const { data: categories = [] } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = parseFloat(totalAmount);
    const installments = parseInt(totalInstallments);
    
    if (!description || isNaN(total) || isNaN(installments) || installments < 1) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    try {
      await createInstallment.mutateAsync({
        description,
        total_amount: total,
        total_installments: installments,
        current_installment: 1,
        installment_amount: total / installments,
        start_date: new Date().toISOString().split('T')[0],
        category_id: categoryId || null,
      });
      
      toast.success('Parcela adicionada!');
      setOpen(false);
      setDescription('');
      setTotalAmount('');
      setTotalInstallments('');
      setCategoryId('');
    } catch {
      toast.error('Erro ao adicionar parcela');
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
          <DialogTitle className="font-display">Nova Parcela</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: iPhone 15"
              className="atlas-input w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Valor Total
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0,00"
                step="0.01"
                className="atlas-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Nº de Parcelas
              </label>
              <input
                type="number"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                placeholder="12"
                min="1"
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
          
          {totalAmount && totalInstallments && (
            <div className="p-3 rounded-lg bg-atlas-purple/10 border border-atlas-purple/20">
              <p className="text-sm text-muted-foreground">Valor por parcela:</p>
              <p className="font-display font-bold text-atlas-purple">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(parseFloat(totalAmount) / parseInt(totalInstallments) || 0)}
              </p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={createInstallment.isPending}
            className="atlas-btn-primary w-full"
          >
            {createInstallment.isPending ? 'Salvando...' : 'Adicionar Parcela'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
