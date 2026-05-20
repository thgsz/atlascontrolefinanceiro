import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { SubscriptionsModule } from '@/components/atlas/modules/SubscriptionsModule';
import { RecurringExpensesList } from '@/components/atlas/RecurringExpensesList';
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses';

export default function SubscriptionsPage() {
  const { data: expenses = [] } = useRecurringExpenses();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Assinaturas</h1>
        <p className="text-muted-foreground">
          Gerencie suas despesas recorrentes e assinaturas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SubscriptionsModule />
        <RecurringExpensesList expenses={expenses} />
      </div>
    </DashboardLayout>
  );
}
