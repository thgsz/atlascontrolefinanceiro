import { memo } from 'react';
import { cn } from '@/lib/utils';
import { usePrivacy } from '@/lib/privacy-context';
import { ASSET_TYPE_MAP } from '@/lib/investments-constants';
import type { InvestmentAsset } from '@/hooks/useInvestments';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AssetCardProps {
  asset: InvestmentAsset;
  onClick: (asset: InvestmentAsset) => void;
}

function AssetCardComponent({ asset, onClick }: AssetCardProps) {
  const { maskCurrency, isPrivate } = usePrivacy();
  const info = ASSET_TYPE_MAP[asset.asset_type];

  const quantity = Number(asset.quantity);
  const avg = Number(asset.average_price);
  const invested = Number(asset.invested_amount) || quantity * avg;
  const current = asset.current_price != null ? Number(asset.current_price) * quantity : invested;
  const profit = current - invested;
  const pct = invested > 0 ? (profit / invested) * 100 : 0;
  const positive = profit >= 0;

  return (
    <button
      type="button"
      onClick={() => onClick(asset)}
      className="atlas-card w-full text-left p-4 hover:bg-secondary/30 transition-colors atlas-press"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)` }}
          >
            {(asset.ticker || asset.name).slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{asset.ticker || asset.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {info.label}
              {asset.institution ? ` · ${asset.institution}` : ''}
            </p>
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0',
            positive ? 'text-atlas-income bg-atlas-income/10' : 'text-atlas-expense bg-atlas-expense/10'
          )}
        >
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPrivate ? '••' : `${positive ? '+' : ''}${pct.toFixed(2)}%`}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Qtd</p>
          <p className="font-medium">{isPrivate ? '••' : quantity.toLocaleString('pt-BR')}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Investido</p>
          <p className="font-medium">{maskCurrency(invested)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Atual</p>
          <p className={cn('font-medium', positive ? 'text-atlas-income-light' : 'text-atlas-expense-light')}>
            {maskCurrency(current)}
          </p>
        </div>
      </div>
    </button>
  );
}

export const AssetCard = memo(AssetCardComponent);