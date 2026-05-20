import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrivacy } from '@/lib/privacy-context';

interface FinancialHealthCardProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function FinancialHealthCard({ totalIncome, totalExpenses, balance }: FinancialHealthCardProps) {
  const { isPrivate } = usePrivacy();

  const { score, label, colorClass, barColor } = useMemo(() => {
    // No data
    if (totalIncome === 0 && totalExpenses === 0) {
      return { score: 0, label: 'Sem dados', colorClass: 'text-muted-foreground', barColor: 'bg-muted-foreground' };
    }

    let s = 50; // base

    // Balance ratio (income vs expenses)
    if (totalIncome > 0) {
      const ratio = totalExpenses / totalIncome;
      if (ratio <= 0.5) s += 30;
      else if (ratio <= 0.7) s += 20;
      else if (ratio <= 0.85) s += 10;
      else if (ratio <= 1.0) s += 0;
      else s -= 15;
    } else if (totalExpenses > 0) {
      s -= 25;
    }

    // Positive balance bonus
    if (balance > 0) s += 15;
    else if (balance < 0) s -= 20;

    // Savings rate bonus
    if (totalIncome > 0) {
      const savingsRate = (totalIncome - totalExpenses) / totalIncome;
      if (savingsRate >= 0.3) s += 5;
    }

    s = Math.max(0, Math.min(100, s));

    let label: string;
    let colorClass: string;
    let barColor: string;

    if (s >= 75) {
      label = 'Saudável';
      colorClass = 'text-atlas-income';
      barColor = 'bg-atlas-income';
    } else if (s >= 50) {
      label = 'Atenção';
      colorClass = 'text-atlas-yellow';
      barColor = 'bg-atlas-yellow';
    } else {
      label = 'Risco';
      colorClass = 'text-atlas-expense';
      barColor = 'bg-atlas-expense';
    }

    return { score: Math.round(s), label, colorClass, barColor };
  }, [totalIncome, totalExpenses, balance]);

  return (
    <div className="atlas-module">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-base">Saúde Financeira</h3>
        </div>
        <span className={cn('text-sm font-medium', colorClass)}>
          {isPrivate ? '••••' : label}
        </span>
      </div>

      <div className="flex items-end gap-4">
        <div className={cn('font-display text-4xl font-bold tabular-nums', colorClass)}>
          {isPrivate ? '••' : score}
        </div>
        <span className="text-muted-foreground text-sm mb-1">/ 100</span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 rounded-full bg-secondary/50 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: isPrivate ? '0%' : `${score}%` }}
        />
      </div>
    </div>
  );
}
