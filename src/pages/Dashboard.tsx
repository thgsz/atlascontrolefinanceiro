import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { useProfile } from '@/hooks/useProfile';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { SummaryCard } from '@/components/atlas/SummaryCard';
import { MonthSelector } from '@/components/atlas/MonthSelector';
import { TransactionItem } from '@/components/atlas/TransactionItem';
import { AddTransactionDialog } from '@/components/atlas/AddTransactionDialog';
import { RaioXChart } from '@/components/atlas/modules/RaioXChart';
import { InstallmentsModule } from '@/components/atlas/modules/InstallmentsModule';
import { LimitsModule } from '@/components/atlas/modules/LimitsModule';
import { SubscriptionsModule } from '@/components/atlas/modules/SubscriptionsModule';
import { RemindersModule } from '@/components/atlas/modules/RemindersModule';
import { InsightsModule } from '@/components/atlas/modules/InsightsModule';
import { FinancialHealthCard } from '@/components/atlas/FinancialHealthCard';
import { PrivacyToggle } from '@/components/atlas/PrivacyToggle';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/StaggerList';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: transactions = [] } = useTransactions(selectedMonth, selectedYear);
  const deleteTransaction = useDeleteTransaction();

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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || '';

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <DashboardLayout>
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          {firstName ? `${greeting}, ${firstName}.` : `${greeting}!`}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {firstName ? 'Vamos organizar seu dinheiro.' : 'Complete seu perfil nas configurações.'}
        </p>
      </div>

      {/* Month Selector + Actions */}
      <div className="flex items-center justify-between mb-6">
        <MonthSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={handleMonthChange}
        />
        <div className="flex items-center gap-2">
          <PrivacyToggle />
          <AddTransactionDialog variant="icon" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
          <SummaryCard title="Saldo Disponível" value={balance} type="balance" icon={<Wallet className="w-5 h-5 text-primary" />} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '120ms' }}>
          <SummaryCard title="Receitas" value={totalIncome} type="income" icon={<TrendingUp className="w-5 h-5 text-atlas-income" />} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '190ms' }}>
          <SummaryCard title="Despesas" value={totalExpenses} type="expense" icon={<TrendingDown className="w-5 h-5 text-atlas-expense" />} />
        </div>
      </div>

      {/* Financial Health + Raio-X */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="animate-fade-in" style={{ animationDelay: '220ms' }}>
          <FinancialHealthCard
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
          />
        </div>
        <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '280ms' }}>
          <RaioXChart transactions={transactions} />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="animate-fade-in" style={{ animationDelay: '320ms' }}><InstallmentsModule /></div>
        <div className="animate-fade-in" style={{ animationDelay: '360ms' }}><LimitsModule month={selectedMonth} year={selectedYear} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}><SubscriptionsModule /></div>
        <div className="animate-fade-in" style={{ animationDelay: '440ms' }}><RemindersModule /></div>
      </div>

      {/* Atlas Insights */}
      <div className="animate-fade-in mb-8" style={{ animationDelay: '480ms' }}>
        <InsightsModule
          transactions={transactions}
          previousTransactions={previousTransactions}
          month={selectedMonth}
          year={selectedYear}
        />
      </div>

      {/* Recent Transactions */}
      <div className="atlas-module">
        <div className="atlas-module-header">
          <div>
            <h3 className="atlas-module-title">Transações Recentes</h3>
            <p className="atlas-module-subtitle">Últimas movimentações do mês</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma transação neste mês</p>
          </div>
        ) : (
          <StaggerList className="space-y-1">
            {transactions.slice(0, 5).map((transaction) => (
              <StaggerItem key={transaction.id}>
                <TransactionItem
                  transaction={transaction}
                  onDelete={(id) => deleteTransaction.mutate(id)}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>
    </DashboardLayout>
  );
}
