import { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '@/hooks/useTransactions';
import { usePrivacy } from '@/lib/privacy-context';
import { cn } from '@/lib/utils';

interface FinanceChartProps {
  transactions: Transaction[];
  month: number;
  year: number;
}

export function FinanceChart({ transactions, month, year }: FinanceChartProps) {
  const [viewType, setViewType] = useState<'income' | 'expense' | 'both'>('both');
  const { maskCurrency, isPrivate } = usePrivacy();

  const chartData = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyData: Record<number, { income: number; expense: number }> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dailyData[i] = { income: 0, expense: 0 };
    }
    transactions.forEach((t) => {
      const day = new Date(t.date + 'T00:00:00').getDate();
      if (t.type === 'income') dailyData[day].income += Number(t.amount);
      else dailyData[day].expense += Number(t.amount);
    });
    let cumulativeIncome = 0;
    let cumulativeExpense = 0;
    return Object.entries(dailyData).map(([day, data]) => {
      cumulativeIncome += data.income;
      cumulativeExpense += data.expense;
      return { day: Number(day), income: cumulativeIncome, expense: cumulativeExpense };
    });
  }, [transactions, month, year]);

  const formatAxisCurrency = (value: number) => {
    if (isPrivate) return '••••';
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value}`;
  };

  return (
    <div className="atlas-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-lg">Evolução Financeira</h3>
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
          <button
            onClick={() => setViewType('income')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewType === 'income' ? 'bg-atlas-income/20 text-atlas-income-light' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Receitas
          </button>
          <button
            onClick={() => setViewType('expense')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewType === 'expense' ? 'bg-atlas-expense/20 text-atlas-expense-light' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Despesas
          </button>
          <button
            onClick={() => setViewType('both')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              viewType === 'both' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Ambos
          </button>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(158, 72%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(158, 72%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              tickFormatter={(day) => `${day}`}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
              tickFormatter={formatAxisCurrency}
              width={70}
            />
            {!isPrivate && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222, 47%, 10%)',
                  border: '1px solid hsl(222, 30%, 16%)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
                formatter={(value: number, name: string) => [
                  maskCurrency(value),
                  name === 'income' ? 'Receitas' : 'Despesas',
                ]}
                labelFormatter={(day) => `Dia ${day}`}
              />
            )}
            {(viewType === 'income' || viewType === 'both') && (
              <Area type="monotone" dataKey="income" stroke="hsl(158, 72%, 45%)" strokeWidth={2} fill="url(#incomeGradient)" />
            )}
            {(viewType === 'expense' || viewType === 'both') && (
              <Area type="monotone" dataKey="expense" stroke="hsl(0, 72%, 55%)" strokeWidth={2} fill="url(#expenseGradient)" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
