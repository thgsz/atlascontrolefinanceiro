import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactions';
import { CategoryIcon } from './CategoryIcon';
import { usePrivacy } from '@/lib/privacy-context';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export const TransactionItem = memo(function TransactionItem({ transaction, onDelete, onClick }: TransactionItemProps) {
  const { maskCurrency } = usePrivacy();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="atlas-transaction group">
      <div className="flex items-center gap-4">
        <CategoryIcon
          icon={transaction.category?.icon || 'circle'}
          color={transaction.category?.color || '#6b7280'}
        />
        <div>
          <p className="font-medium text-foreground">
            {transaction.description || transaction.category?.name || 'Sem categoria'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.date)}
            {transaction.category && ` • ${transaction.category.name}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            'font-semibold font-display transition-all duration-200',
            transaction.type === 'income' ? 'text-atlas-income-light' : 'text-atlas-expense-light'
          )}
        >
          {transaction.type === 'income' ? '+' : '-'} {maskCurrency(transaction.amount)}
        </span>

        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});
