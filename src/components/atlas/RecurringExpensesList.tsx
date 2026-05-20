import { RecurringExpense, useDeleteRecurringExpense } from '@/hooks/useRecurringExpenses';
import { CategoryIcon } from './CategoryIcon';
import { Calendar, Trash2 } from 'lucide-react';
import { AddRecurringExpenseDialog } from './dialogs/AddRecurringExpenseDialog';
import { usePrivacy } from '@/lib/privacy-context';
import { toast } from 'sonner';

interface RecurringExpensesListProps {
  expenses: RecurringExpense[];
}

export function RecurringExpensesList({ expenses }: RecurringExpensesListProps) {
  const deleteExpense = useDeleteRecurringExpense();
  const { maskCurrency } = usePrivacy();

  const today = new Date().getDate();

  const sortedExpenses = [...expenses].sort((a, b) => {
    const dayA = a.day_of_month || 1;
    const dayB = b.day_of_month || 1;
    const daysUntilA = dayA >= today ? dayA - today : 30 - today + dayA;
    const daysUntilB = dayB >= today ? dayB - today : 30 - today + dayB;
    return daysUntilA - daysUntilB;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success('Despesa removida');
    } catch {
      toast.error('Erro ao remover despesa');
    }
  };

  const totalMonthly = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (expenses.length === 0) {
    return (
      <div className="atlas-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">Despesas Fixas</h3>
          <AddRecurringExpenseDialog />
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Nenhuma despesa fixa cadastrada</p>
          <p className="text-sm mt-1">Adicione suas despesas mensais recorrentes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Próximas Despesas Fixas</h3>
        <AddRecurringExpenseDialog />
      </div>

      <div className="space-y-3">
        {sortedExpenses.slice(0, 5).map((expense) => {
          const isUpcoming = expense.day_of_month && expense.day_of_month >= today;
          const isPast = expense.day_of_month && expense.day_of_month < today;

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <CategoryIcon
                  icon={expense.category?.icon || 'circle'}
                  color={expense.category?.color || '#6b7280'}
                  size="sm"
                />
                <div>
                  <p className="font-medium text-sm">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.day_of_month ? `Dia ${expense.day_of_month}` : 'Sem data definida'}
                    {isUpcoming && <span className="ml-2 text-atlas-cyan">• em breve</span>}
                    {isPast && <span className="ml-2 text-muted-foreground">• próximo mês</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-atlas-expense-light">
                  {maskCurrency(expense.amount)}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {expenses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total mensal</span>
            <span className="font-display font-bold text-atlas-expense">
              {maskCurrency(totalMonthly)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
