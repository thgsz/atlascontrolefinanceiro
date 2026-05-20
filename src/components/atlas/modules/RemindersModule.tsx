import { Bell, Trash2, Check, Calendar, DollarSign } from 'lucide-react';
import { useReminders, useUpdateReminder, useDeleteReminder, useUpcomingReminders } from '@/hooks/useReminders';
import { AddReminderDialog } from '../dialogs/AddReminderDialog';
import { usePrivacy } from '@/lib/privacy-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RemindersModule() {
  const { data: reminders = [], isLoading } = useReminders();
  const upcomingReminders = useUpcomingReminders();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();
  const { maskCurrency } = usePrivacy();

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "dd 'de' MMM", { locale: ptBR });
  };

  const getDaysUntilDue = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(date, today);
  };

  const handleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await updateReminder.mutateAsync({ id, is_completed: !isCompleted });
      toast.success(isCompleted ? 'Lembrete reaberto' : 'Lembrete concluído!');
    } catch {
      toast.error('Erro ao atualizar lembrete');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReminder.mutateAsync(id);
      toast.success('Lembrete removido');
    } catch {
      toast.error('Erro ao remover lembrete');
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const activeReminders = sortedReminders.filter(r => !r.is_completed);

  return (
    <div className="atlas-module">
      <div className="atlas-module-header">
        <div>
          <h3 className="atlas-module-title">
            <Bell className="w-5 h-5 text-atlas-pink" />
            Lembretes
          </h3>
          <p className="atlas-module-subtitle">
            {upcomingReminders.length > 0 
              ? `${upcomingReminders.length} próximo${upcomingReminders.length > 1 ? 's' : ''} nos próximos 7 dias`
              : 'Suas contas e vencimentos'
            }
          </p>
        </div>
        <AddReminderDialog />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : activeReminders.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Nenhum lembrete</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Crie lembretes para suas contas
          </p>
        </div>
      ) : (
        <div className="space-y-2">
            {activeReminders.map((reminder) => {
              const daysUntil = getDaysUntilDue(reminder.due_date);
              const isOverdue = isPast(new Date(reminder.due_date)) && !isToday(new Date(reminder.due_date));
              const isUrgent = daysUntil <= 1 && daysUntil >= 0;
              
              return (
                <div
                  key={reminder.id}
                  className={cn(
                    'p-3 rounded-xl transition-all group',
                    reminder.is_completed
                      ? 'bg-secondary/20 opacity-60'
                      : isOverdue
                      ? 'bg-destructive/10 border border-destructive/30'
                      : isUrgent
                      ? 'bg-orange-500/10 border border-orange-500/30'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleComplete(reminder.id, reminder.is_completed)}
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        reminder.is_completed
                          ? 'bg-atlas-green border-atlas-green text-white'
                          : 'border-muted-foreground/30 hover:border-atlas-pink'
                      )}
                    >
                      {reminder.is_completed && <Check className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium text-sm',
                        reminder.is_completed && 'line-through text-muted-foreground'
                      )}>
                        {reminder.title}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <span className={cn(
                          'flex items-center gap-1 text-xs',
                          isOverdue ? 'text-destructive font-medium' :
                          isUrgent ? 'text-orange-500 font-medium' :
                          'text-muted-foreground'
                        )}>
                          <Calendar className="w-3 h-3" />
                          {formatDueDate(reminder.due_date)}
                          {isOverdue && ' (atrasado)'}
                        </span>
                        
                        {reminder.amount && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            {maskCurrency(reminder.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
}
