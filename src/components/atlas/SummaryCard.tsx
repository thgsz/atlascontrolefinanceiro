import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy-context';
import { AnimatedCounter } from './AnimatedCounter';

interface SummaryCardProps {
  title: string;
  value: number;
  type?: 'income' | 'expense' | 'balance';
  percentageChange?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  type = 'balance',
  percentageChange,
  icon,
  className
}: SummaryCardProps) {
  const { isPrivate } = usePrivacy();

  const cardClasses = {
    income: 'atlas-summary-income',
    expense: 'atlas-summary-expense',
    balance: 'atlas-summary-balance'
  };
  const valueColors = {
    income: 'text-atlas-income-light',
    expense: 'text-atlas-expense-light',
    balance: 'text-primary'
  };
  const isPositiveChange = percentageChange && percentageChange > 0;
  const isNegativeChange = percentageChange && percentageChange < 0;

  return (
    <div className={cn('relative transition-all duration-300', cardClasses[type], className)}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-secondary-foreground">{title}</span>
        {icon && <div className="p-2.5 rounded-xl bg-secondary/50 backdrop-blur-sm">{icon}</div>}
      </div>

      <AnimatedCounter
        value={value}
        className={cn('text-3xl font-bold font-display tracking-tight transition-all duration-200', valueColors[type])}
      />

      {percentageChange !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositiveChange && (
            <div className="p-1 rounded-full bg-atlas-income/10">
              <TrendingUp className="w-3 h-3 text-atlas-income" />
            </div>
          )}
          {isNegativeChange && (
            <div className="p-1 rounded-full bg-atlas-expense/10">
              <TrendingDown className="w-3 h-3 text-atlas-expense" />
            </div>
          )}
          <span className={cn('text-xs font-medium', isPositiveChange && 'text-atlas-income', isNegativeChange && 'text-atlas-expense', !isPositiveChange && !isNegativeChange && 'text-muted-foreground')}>
            {isPrivate ? '••••' : (
              <>
                {isPositiveChange && '+'}
                {percentageChange.toFixed(1)}% vs mês anterior
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
