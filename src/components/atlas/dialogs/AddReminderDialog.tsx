import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useCreateReminder } from '@/hooks/useReminders';
import { toast } from 'sonner';

export function AddReminderDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [notifyBefore, setNotifyBefore] = useState('1');
  
  const createReminder = useCreateReminder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate) {
      toast.error('Preencha o título e a data de vencimento');
      return;
    }

    try {
      await createReminder.mutateAsync({
        title,
        description: description || null,
        due_date: dueDate,
        amount: amount ? parseFloat(amount) : null,
        is_completed: false,
        notify_before_days: parseInt(notifyBefore) || 1,
      });
      
      toast.success('Lembrete criado!');
      setOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAmount('');
      setNotifyBefore('1');
    } catch {
      toast.error('Erro ao criar lembrete');
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="atlas-btn-ghost p-2 rounded-lg">
          <Plus className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="atlas-card border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Lembrete</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pagar conta de luz"
              className="atlas-input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={2}
              className="atlas-input w-full resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Data de Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={minDate}
                className="atlas-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Valor (opcional)
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Notificar com antecedência
            </label>
            <select
              value={notifyBefore}
              onChange={(e) => setNotifyBefore(e.target.value)}
              className="atlas-input w-full"
            >
              <option value="1">1 dia antes</option>
              <option value="2">2 dias antes</option>
              <option value="3">3 dias antes</option>
              <option value="7">1 semana antes</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={createReminder.isPending}
            className="atlas-btn-primary w-full"
          >
            {createReminder.isPending ? 'Salvando...' : 'Criar Lembrete'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
