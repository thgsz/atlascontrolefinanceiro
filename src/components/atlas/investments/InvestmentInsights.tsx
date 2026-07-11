import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { ASSET_TYPE_MAP } from '@/lib/investments-constants';
import type { InvestmentAsset, InvestmentMovement } from '@/hooks/useInvestments';

interface Props {
  assets: InvestmentAsset[];
  movements: InvestmentMovement[];
  monthlyContributions: number;
  monthlyDividends: number;
}

export function InvestmentInsights({ assets, movements, monthlyContributions, monthlyDividends }: Props) {
  const insights = useMemo(() => {
    const out: string[] = [];
    if (assets.length === 0) return out;

    const totalCurrent = assets.reduce((s, a) => {
      const val =
        a.current_price != null
          ? Number(a.current_price) * Number(a.quantity)
          : Number(a.invested_amount);
      return s + val;
    }, 0);
    const totalInvested = assets.reduce((s, a) => s + Number(a.invested_amount), 0);

    // Concentração por tipo
    const byType: Record<string, number> = {};
    assets.forEach((a) => {
      const val = a.current_price != null
        ? Number(a.current_price) * Number(a.quantity)
        : Number(a.invested_amount);
      byType[a.asset_type] = (byType[a.asset_type] || 0) + val;
    });
    const top = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
    if (top && totalCurrent > 0) {
      const pct = (top[1] / totalCurrent) * 100;
      if (pct >= 60) {
        out.push(
          `Sua carteira possui concentração elevada em ${ASSET_TYPE_MAP[top[0] as keyof typeof ASSET_TYPE_MAP].label} (${pct.toFixed(0)}%). Considere diversificar.`
        );
      } else if (Object.keys(byType).length >= 4) {
        out.push('Sua carteira está bem diversificada entre diferentes tipos de ativos.');
      }
    }

    // Rentabilidade
    if (totalInvested > 0) {
      const pct = ((totalCurrent - totalInvested) / totalInvested) * 100;
      if (pct > 0) {
        out.push(`Seu patrimônio cresceu ${pct.toFixed(2)}% em relação ao valor investido.`);
      } else if (pct < -1) {
        out.push(`Sua carteira está ${Math.abs(pct).toFixed(2)}% abaixo do valor investido.`);
      }
    }

    // Dividendos e aportes no mês
    if (monthlyDividends > 0) {
      out.push(
        `Você recebeu ${monthlyDividends.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em proventos este mês.`
      );
    }

    const now = new Date();
    const monthMovs = movements.filter((m) => {
      const d = new Date(m.movement_date + 'T00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const nContribs = monthMovs.filter((m) => m.movement_type === 'aporte' || m.movement_type === 'compra').length;
    if (nContribs > 0) {
      out.push(`Você realizou ${nContribs} ${nContribs === 1 ? 'aporte' : 'aportes'} este mês.`);
    }
    if (monthlyContributions > 0 && nContribs === 0) {
      out.push(
        `Aportes deste mês: ${monthlyContributions.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`
      );
    }

    // Instituições
    const institutions = new Set(assets.map((a) => a.institution).filter(Boolean));
    if (institutions.size >= 2) {
      out.push(`Você investe em ${institutions.size} instituições diferentes.`);
    }

    return out;
  }, [assets, movements, monthlyContributions, monthlyDividends]);

  if (insights.length === 0) return null;

  return (
    <div className="atlas-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display font-semibold text-lg">Atlas Insights</h3>
      </div>
      <ul className="space-y-2">
        {insights.map((text, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}