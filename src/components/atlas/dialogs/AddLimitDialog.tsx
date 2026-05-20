import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useUpsertCategoryLimit } from '@/hooks/useCategoryLimits';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

interface AddLimitDialogProps {
  existingCategoryIds: string[];
}

export function AddLimitDialog({ existingCategoryIds }: AddLimitDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  
  const upsertLimit = useUpsertCategoryLimit();
  const { data: categories = [] } = useCategories();
  
  const availableCategories = categories.filter(
    (cat) => !existingCategoryIds.includes(cat.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const limit = parseFloat(monthlyLimit);
    
    if (!categoryId || isNaN(limit) || limit <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    try {
      await upsertLimit.mutateAsync({
        category_id: categoryId,
        monthly_limit: limit,
      });
      
      toast.success('Limite definido!');
      setOpen(false);
      setCategoryId('');
      setMonthlyLimit('');
    } catch {
      toast.error('Erro ao definir limite');
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
          <DialogTitle className="font-display">Novo Limite</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="atlas-input w-full"
            >
              <option value="">Selecione uma categoria...</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {availableCategories.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Todas as categorias já possuem limite definido.
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Limite Mensal (R$)
            </label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className="atlas-input w-full"
            />
          </div>
          
          <button
            type="submit"
            disabled={upsertLimit.isPending || availableCategories.length === 0}
            className="atlas-btn-primary w-full"
          >
            {upsertLimit.isPending ? 'Salvando...' : 'Definir Limite'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
