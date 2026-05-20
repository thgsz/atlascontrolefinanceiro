import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '@/hooks/useTransactions';
import { Brain, TrendingUp, TrendingDown, Calendar, Crown, ShoppingBag, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrivacy } from '@/lib/privacy-context';

interface InsightsModuleProps {
  transactions: Transaction[];
  previousTransactions: Transaction[];
  month: number;
  year: number;
}

interface Insight {
  icon: React.ReactNode;
  text: string;
  type: 'info' | 'warning' | 'success';
}

export function InsightsModule({ transactions, previousTransactions, month, year }: InsightsModuleProps) {
  const { maskCurrency, isPrivate } = usePrivacy();

  const fmtCurrency = (v: number) => maskCurrency(v);

  const insights = useMemo(() => {
    const result: Insight[] = [];
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const prevExpenses = previousTransactions.filter(t => t.type === 'expense');
    const prevTotal = prevExpenses.reduce((s, t) => s + Number(t.amount), 0);

    if (expenses.length === 0) return result;

    const catMap = new Map<string, { name: string; total: number }>();
    expenses.forEach(t => {
      const name = t.category?.name || 'Outros';
      const e = catMap.get(name);
      if (e) e.total += Number(t.amount);
      else catMap.set(name, { name, total: Number(t.amount) });
    });
    const topCat = Array.from(catMap.values()).sort((a, b) => b.total - a.total)[0];
    if (topCat && totalExpenses > 0) {
      const pct = ((topCat.total / totalExpenses) * 100).toFixed(0);
      result.push({
        icon: <ShoppingBag className="w-4 h-4" />,
        text: isPrivate
          ? `Você gastou ${pct}% do seu dinheiro em ${topCat.name} este mês.`
          : `Você gastou ${pct}% do seu dinheiro em ${topCat.name} este mês.`,
        type: Number(pct) > 50 ? 'warning' : 'info',
      });
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
    const dayCount = isCurrentMonth ? today.getDate() : new Date(year, month, 0).getDate();
    if (dayCount > 0) {
      const avg = totalExpenses / dayCount;
      result.push({
        icon: <Calendar className="w-4 h-4" />,
        text: `Sua média diária de gastos é ${fmtCurrency(avg)}.`,
        type: 'info',
      });
    }

    const biggest = expenses.reduce((max, t) => Number(t.amount) > Number(max.amount) ? t : max);
    result.push({
      icon: <Crown className="w-4 h-4" />,
      text: `Seu maior gasto foi ${fmtCurrency(Number(biggest.amount))} em ${biggest.category?.name || 'Sem categoria'}.`,
      type: 'info',
    });

    if (prevTotal > 0) {
      const change = ((totalExpenses - prevTotal) / prevTotal) * 100;
      if (change > 0) {
        result.push({
          icon: <TrendingUp className="w-4 h-4" />,
          text: `Seus gastos aumentaram ${change.toFixed(0)}% em relação ao mês passado.`,
          type: 'warning',
        });
      } else {
        result.push({
          icon: <TrendingDown className="w-4 h-4" />,
          text: `Seus gastos diminuíram ${Math.abs(change).toFixed(0)}% em relação ao mês passado.`,
          type: 'success',
        });
      }
    }

    const weekendTotal = expenses
      .filter(t => { const d = new Date(t.date + 'T00:00:00').getDay(); return d === 0 || d === 6; })
      .reduce((s, t) => s + Number(t.amount), 0);
    if (totalExpenses > 0 && weekendTotal / totalExpenses > 0.4) {
      result.push({
        icon: <Clock className="w-4 h-4" />,
        text: `A maior parte dos seus gastos acontece nos finais de semana.`,
        type: 'info',
      });
    }

    return result;
  }, [transactions, previousTransactions, month, year, isPrivate, fmtCurrency]);

  if (insights.length === 0) return null;

  const typeStyles = {
    info: 'bg-primary/10 text-primary',
    warning: 'bg-atlas-expense/10 text-atlas-expense',
    success: 'bg-atlas-income/10 text-atlas-income',
  };

  return (
    <div className="atlas-module">
      <div className="atlas-module-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="atlas-module-title">Atlas Insights</h3>
            <p className="atlas-module-subtitle">Análises inteligentes das suas finanças</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 transition-colors duration-150"
          >
            <div className={cn('p-2 rounded-lg shrink-0', typeStyles[insight.type])}>
              {insight.icon}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{insight.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
