import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '@/hooks/useTransactions';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  CalendarDays, TrendingUp, TrendingDown, Crown, Target, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrivacy } from '@/lib/privacy-context';

interface AnalyticsInsightsProps {
  transactions: Transaction[];
  previousTransactions: Transaction[];
  month: number;
  year: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

function InsightCard({ index, children, className }: { index: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      className={cn('atlas-card p-5 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-200', className)}>
      {children}
    </motion.div>
  );
}

export function AnalyticsInsights({ transactions, previousTransactions, month, year }: AnalyticsInsightsProps) {
  const { maskCurrency, isPrivate } = usePrivacy();

  const expenses = useMemo(() => transactions.filter((t) => t.type === 'expense'), [transactions]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, t) => sum + Number(t.amount), 0), [expenses]);
  const prevTotalExpenses = useMemo(
    () => previousTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
    [previousTransactions]
  );

  const dailyAverage = useMemo(() => {
    const today = new Date();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
    const dayCount = isCurrentMonth ? today.getDate() : new Date(year, month, 0).getDate();
    return dayCount > 0 ? totalExpenses / dayCount : 0;
  }, [totalExpenses, month, year]);

  const biggestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return expenses.reduce((max, t) => Number(t.amount) > Number(max.amount) ? t : max);
  }, [expenses]);

  const topCategory = useMemo(() => {
    const map = new Map<string, { name: string; total: number; color: string }>();
    expenses.forEach((t) => {
      const name = t.category?.name || 'Outros';
      const existing = map.get(name);
      if (existing) existing.total += Number(t.amount);
      else map.set(name, { name, total: Number(t.amount), color: t.category?.color || '#6b7280' });
    });
    if (map.size === 0) return null;
    return Array.from(map.values()).sort((a, b) => b.total - a.total)[0];
  }, [expenses]);

  const monthlyChange = useMemo(() => {
    if (prevTotalExpenses === 0) return null;
    return ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100;
  }, [totalExpenses, prevTotalExpenses]);

  const weeklyData = useMemo(() => {
    const weeks = [
      { name: 'Sem 1', total: 0 }, { name: 'Sem 2', total: 0 },
      { name: 'Sem 3', total: 0 }, { name: 'Sem 4', total: 0 },
    ];
    expenses.forEach((t) => {
      const day = new Date(t.date + 'T00:00:00').getDate();
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);
      weeks[weekIndex].total += Number(t.amount);
    });
    return weeks;
  }, [expenses]);

  const topCategoryPct = topCategory && totalExpenses > 0
    ? ((topCategory.total / totalExpenses) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Daily Average */}
      <InsightCard index={0}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10"><CalendarDays className="w-4 h-4 text-primary" /></div>
          <span className="text-sm text-muted-foreground">Média diária</span>
        </div>
        <p className="font-display text-2xl font-bold tracking-tight">{maskCurrency(dailyAverage)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          baseado em {totalExpenses > 0 ? 'gastos do mês' : 'nenhum gasto'}
        </p>
      </InsightCard>

      {/* Biggest Expense */}
      <InsightCard index={1}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-atlas-expense/10"><Crown className="w-4 h-4 text-atlas-expense" /></div>
          <span className="text-sm text-muted-foreground">Maior gasto</span>
        </div>
        {biggestExpense ? (
          <>
            <p className="font-display text-2xl font-bold tracking-tight">{maskCurrency(Number(biggestExpense.amount))}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {biggestExpense.category?.name || 'Sem categoria'} — {biggestExpense.description || 'Sem descrição'}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum gasto registrado</p>
        )}
      </InsightCard>

      {/* Top Category */}
      <InsightCard index={2}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-accent/50"><Target className="w-4 h-4 text-primary" /></div>
          <span className="text-sm text-muted-foreground">Categoria dominante</span>
        </div>
        {topCategory ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: topCategory.color }} />
              <p className="font-display text-lg font-bold truncate">{topCategory.name}</p>
            </div>
            <p className="text-sm font-semibold">{maskCurrency(topCategory.total)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPrivate ? '••••' : `${topCategoryPct}% do total de gastos`}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum gasto registrado</p>
        )}
      </InsightCard>

      {/* Monthly Comparison */}
      <InsightCard index={3}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-secondary/50">
            {monthlyChange !== null && monthlyChange > 0
              ? <TrendingUp className="w-4 h-4 text-atlas-expense" />
              : <TrendingDown className="w-4 h-4 text-atlas-income" />}
          </div>
          <span className="text-sm text-muted-foreground">Gastos vs mês anterior</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Este mês</span>
            <span className="font-semibold">{maskCurrency(totalExpenses)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mês passado</span>
            <span className="font-semibold">{maskCurrency(prevTotalExpenses)}</span>
          </div>
          {monthlyChange !== null && (
            <div className={cn('text-xs font-medium mt-1.5 flex items-center gap-1', monthlyChange > 0 ? 'text-atlas-expense' : 'text-atlas-income')}>
              {monthlyChange > 0 ? '↑' : '↓'} {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
            </div>
          )}
          {monthlyChange === null && prevTotalExpenses === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Sem dados do mês anterior</p>
          )}
        </div>
      </InsightCard>

      {/* Weekly Spending Chart */}
      <InsightCard index={4} className="md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10"><BarChart3 className="w-4 h-4 text-primary" /></div>
          <span className="text-sm text-muted-foreground">Gastos por semana</span>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
                tickFormatter={(v) => isPrivate ? '••••' : (v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`)}
                width={65}
              />
              {!isPrivate && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 16%)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number) => [maskCurrency(value), 'Gastos']}
                />
              )}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </InsightCard>
    </div>
  );
}
