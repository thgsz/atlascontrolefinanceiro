import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePrivacy } from '@/lib/privacy-context';
import { ASSET_TYPE_MAP } from '@/lib/investments-constants';
import type { InvestmentAsset } from '@/hooks/useInvestments';

interface AllocationChartProps {
  assets: InvestmentAsset[];
  onSelect?: (assetType: string) => void;
}

export function AllocationChart({ assets, onSelect }: AllocationChartProps) {
  const { maskCurrency, isPrivate } = usePrivacy();

  const data = useMemo(() => {
    const totals: Record<string, { name: string; value: number; color: string; key: string }> = {};
    assets.forEach((a) => {
      const info = ASSET_TYPE_MAP[a.asset_type];
      const val = Number(a.current_price ?? 0) > 0 && Number(a.quantity) > 0
        ? Number(a.current_price) * Number(a.quantity)
        : Number(a.invested_amount);
      if (!totals[a.asset_type]) {
        totals[a.asset_type] = { name: info.label, value: 0, color: info.color, key: a.asset_type };
      }
      totals[a.asset_type].value += val;
    });
    return Object.values(totals).sort((a, b) => b.value - a.value);
  }, [assets]);

  const total = data.reduce((s, i) => s + i.value, 0);

  if (data.length === 0) {
    return (
      <div className="atlas-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Distribuição da Carteira</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
          Nenhum investimento cadastrado
        </div>
      </div>
    );
  }

  return (
    <div className="atlas-card p-6">
      <h3 className="font-display font-semibold text-lg mb-4">Distribuição da Carteira</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="h-[200px] w-[200px] relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={2}
                dataKey="value"
                onClick={(entry: { key?: string }) => entry.key && onSelect?.(entry.key)}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              {!isPrivate && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 30%, 16%)',
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}
                  formatter={(v: number) => maskCurrency(v)}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display font-bold text-sm">{maskCurrency(total)}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full space-y-2 max-h-[200px] overflow-y-auto">
          {data.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect?.(item.key)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors atlas-press"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{maskCurrency(item.value)}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {isPrivate ? '••' : `${((item.value / total) * 100).toFixed(0)}%`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}