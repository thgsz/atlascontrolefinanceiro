import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { MonthSelector } from '@/components/atlas/MonthSelector';
import { ExpenseDistributionChart } from '@/components/atlas/ExpenseDistributionChart';
import { FinanceChart } from '@/components/atlas/FinanceChart';
import { AnalyticsInsights } from '@/components/atlas/modules/AnalyticsInsights';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';

export default function Analytics() {
  const { user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: transactions = [] } = useTransactions(selectedMonth, selectedYear);

  // Fetch previous month transactions for comparison
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevEndDate = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];

  const { data: previousTransactions = [] } = useQuery({
    queryKey: ['transactions', user?.id, prevMonth, prevYear],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('date', prevStartDate)
        .lte('date', prevEndDate)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1">Análises</h1>
          <p className="text-muted-foreground">Insights detalhados sobre suas finanças</p>
        </div>
        <MonthSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ExpenseDistributionChart transactions={transactions} />
        <FinanceChart transactions={transactions} month={selectedMonth} year={selectedYear} />
      </div>

      {/* Insights */}
      <AnalyticsInsights
        transactions={transactions}
        previousTransactions={previousTransactions}
        month={selectedMonth}
        year={selectedYear}
      />
    </DashboardLayout>
  );
}
