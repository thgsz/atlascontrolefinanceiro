import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/hooks/useTransactions';
import { usePrivacy } from '@/lib/privacy-context';

interface ExpenseDistributionChartProps {
  transactions: Transaction[];
}

export function ExpenseDistributionChart({ transactions }: ExpenseDistributionChartProps) {
  const { maskCurrency, isPrivate } = usePrivacy();

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, { name: string; value: number; color: string }> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const categoryName = t.category?.name || 'Outros';
        const categoryColor = t.category?.color || '#6b7280';
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = { name: categoryName, value: 0, color: categoryColor };
        }
        categoryTotals[categoryName].value += Number(t.amount);
      });
    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="atlas-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Distribuição de Gastos</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Nenhuma despesa registrada
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-card p-6">
      <h3 className="font-display font-semibold text-lg mb-4">Distribuição de Gastos</h3>

      <div className="flex items-center gap-6">
        <div className="h-[180px] w-[180px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {!isPrivate && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 16%)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number) => maskCurrency(value)}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display font-bold text-sm">{maskCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 max-h-[180px] overflow-y-auto">
          {chartData.slice(0, 5).map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{maskCurrency(item.value)}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {isPrivate ? '••' : `${((item.value / totalExpenses) * 100).toFixed(0)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
