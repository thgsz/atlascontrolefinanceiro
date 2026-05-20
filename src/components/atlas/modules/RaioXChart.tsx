import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Scan } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy-context';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category_id: string | null;
  category?: {
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

interface RaioXChartProps {
  transactions: Transaction[];
}

const COLORS = [
  'hsl(173, 80%, 50%)',
  'hsl(265, 72%, 55%)',
  'hsl(25, 95%, 53%)',
  'hsl(158, 72%, 45%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 72%, 55%)',
  'hsl(200, 80%, 50%)',
  'hsl(300, 60%, 50%)',
];

export function RaioXChart({ transactions }: RaioXChartProps) {
  const { maskCurrency, isPrivate } = usePrivacy();

  const chartData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    expenses.forEach((t) => {
      const categoryName = t.category?.name || 'Outros';
      const existing = categoryMap.get(categoryName);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          value: Number(t.amount),
          color: t.category?.color || '#6b7280',
        });
      }
    });

    return Array.from(categoryMap.values())
      .map((item, index) => ({
        ...item,
        color: item.color || COLORS[index % COLORS.length],
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="atlas-module">
        <div className="atlas-module-header">
          <div>
            <h3 className="atlas-module-title">
              <Scan className="w-5 h-5 text-primary" />
              Visão Raio-X
            </h3>
            <p className="atlas-module-subtitle">Saiba onde vai seu dinheiro</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <p>Nenhuma despesa registrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-module">
      <div className="atlas-module-header">
        <div>
          <h3 className="atlas-module-title">
            <Scan className="w-5 h-5 text-primary" />
            Visão Raio-X
          </h3>
          <p className="atlas-module-subtitle">Saiba onde vai seu dinheiro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                stroke="transparent"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {!isPrivate && (
                <Tooltip
                  formatter={(value: number) => maskCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 16%)',
                    borderRadius: '12px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display font-bold text-lg">{maskCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 max-h-52 overflow-y-auto">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{isPrivate ? '••' : `${item.percentage}%`}</p>
                <p className="text-xs text-muted-foreground">{maskCurrency(item.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
