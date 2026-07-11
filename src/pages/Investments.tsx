import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { SummaryCard } from '@/components/atlas/SummaryCard';
import { PrivacyToggle } from '@/components/atlas/PrivacyToggle';
import { AllocationChart } from '@/components/atlas/investments/AllocationChart';
import { AssetCard } from '@/components/atlas/investments/AssetCard';
import { AssetSheet } from '@/components/atlas/investments/AssetSheet';
import { InvestmentInsights } from '@/components/atlas/investments/InvestmentInsights';
import {
  useInvestmentAssets,
  useInvestmentMovements,
  type InvestmentAsset,
} from '@/hooks/useInvestments';
import {
  ASSET_TYPES,
  ASSET_TYPE_MAP,
  DIVIDEND_MOVEMENT_TYPES,
  type AssetType,
} from '@/lib/investments-constants';
import { Wallet, TrendingUp, ArrowUpRight, Coins, Plus, Search } from 'lucide-react';
import { StaggerList, StaggerItem } from '@/components/motion/StaggerList';

type SortKey = 'recent' | 'oldest' | 'profit' | 'loss' | 'value' | 'dividends';

export default function Investments() {
  const { data: assets = [] } = useInvestmentAssets();
  const { data: movements = [] } = useInvestmentMovements();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<InvestmentAsset | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | ''>('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');

  const openNew = () => {
    setSelected(null);
    setSheetOpen(true);
  };
  const openAsset = (a: InvestmentAsset) => {
    setSelected(a);
    setSheetOpen(true);
  };

  const institutions = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => a.institution && set.add(a.institution));
    return Array.from(set).sort();
  }, [assets]);

  const dividendsByAsset = useMemo(() => {
    const map: Record<string, number> = {};
    movements
      .filter((m) => DIVIDEND_MOVEMENT_TYPES.includes(m.movement_type))
      .forEach((m) => {
        map[m.asset_id] = (map[m.asset_id] || 0) + Number(m.total_amount);
      });
    return map;
  }, [movements]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = assets.filter((a) => {
      if (typeFilter && a.asset_type !== typeFilter) return false;
      if (institutionFilter && a.institution !== institutionFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        (a.ticker ?? '').toLowerCase().includes(q) ||
        (a.institution ?? '').toLowerCase().includes(q) ||
        ASSET_TYPE_MAP[a.asset_type].label.toLowerCase().includes(q)
      );
    });

    const profitOf = (a: InvestmentAsset) => {
      const invested = Number(a.invested_amount);
      const current =
        a.current_price != null ? Number(a.current_price) * Number(a.quantity) : invested;
      return current - invested;
    };
    const valueOf = (a: InvestmentAsset) =>
      a.current_price != null
        ? Number(a.current_price) * Number(a.quantity)
        : Number(a.invested_amount);

    switch (sort) {
      case 'oldest':
        list = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
        break;
      case 'profit':
        list = [...list].sort((a, b) => profitOf(b) - profitOf(a));
        break;
      case 'loss':
        list = [...list].sort((a, b) => profitOf(a) - profitOf(b));
        break;
      case 'value':
        list = [...list].sort((a, b) => valueOf(b) - valueOf(a));
        break;
      case 'dividends':
        list = [...list].sort(
          (a, b) => (dividendsByAsset[b.id] || 0) - (dividendsByAsset[a.id] || 0)
        );
        break;
      default:
        list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return list;
  }, [assets, search, typeFilter, institutionFilter, sort, dividendsByAsset]);

  const summary = useMemo(() => {
    const totalInvested = assets.reduce((s, a) => s + Number(a.invested_amount), 0);
    const totalCurrent = assets.reduce((s, a) => {
      const v =
        a.current_price != null
          ? Number(a.current_price) * Number(a.quantity)
          : Number(a.invested_amount);
      return s + v;
    }, 0);
    const profit = totalCurrent - totalInvested;
    const pct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    const now = new Date();
    const inMonth = movements.filter((m) => {
      const d = new Date(m.movement_date + 'T00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyContributions = inMonth
      .filter((m) => m.movement_type === 'aporte' || m.movement_type === 'compra')
      .reduce((s, m) => s + Number(m.total_amount), 0);
    const monthlyDividends = inMonth
      .filter((m) => DIVIDEND_MOVEMENT_TYPES.includes(m.movement_type))
      .reduce((s, m) => s + Number(m.total_amount), 0);

    return { totalInvested, totalCurrent, profit, pct, monthlyContributions, monthlyDividends };
  }, [assets, movements]);

  return (
    <DashboardLayout>
      <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
            Carteira de Investimentos
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Acompanhe a evolução patrimonial e a rentabilidade dos seus ativos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PrivacyToggle />
          <button
            type="button"
            onClick={openNew}
            className="atlas-btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Investimento</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <SummaryCard
          title="Patrimônio Investido"
          value={summary.totalInvested}
          type="balance"
          icon={<Wallet className="w-4 h-4 text-primary" />}
        />
        <SummaryCard
          title="Valor Atual"
          value={summary.totalCurrent}
          type={summary.profit >= 0 ? 'income' : 'expense'}
          percentageChange={summary.pct}
          icon={<TrendingUp className="w-4 h-4 text-atlas-income-light" />}
        />
        <SummaryCard
          title="Aportes do Mês"
          value={summary.monthlyContributions}
          type="balance"
          icon={<ArrowUpRight className="w-4 h-4 text-primary" />}
        />
        <SummaryCard
          title="Dividendos do Mês"
          value={summary.monthlyDividends}
          type="income"
          icon={<Coins className="w-4 h-4 text-atlas-income-light" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AllocationChart
          assets={assets}
          onSelect={(t) => setTypeFilter((prev) => (prev === t ? '' : (t as AssetType)))}
        />
        <InvestmentInsights
          assets={assets}
          movements={movements}
          monthlyContributions={summary.monthlyContributions}
          monthlyDividends={summary.monthlyDividends}
        />
      </div>

      <div className="atlas-card p-4 md:p-5 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ticker, nome, corretora..."
              className="atlas-input w-full pl-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AssetType | '')}
            className="atlas-input md:w-48"
          >
            <option value="">Todos os tipos</option>
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="atlas-input md:w-44"
          >
            <option value="">Todas instituições</option>
            {institutions.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="atlas-input md:w-44"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="value">Maior patrimônio</option>
            <option value="profit">Maior lucro</option>
            <option value="loss">Maior prejuízo</option>
            <option value="dividends">Mais dividendos</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="atlas-card p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-primary" />
          </div>
          <p className="font-medium mb-1">Nenhum investimento por aqui</p>
          <p className="text-sm text-muted-foreground mb-5">
            {assets.length === 0
              ? 'Adicione seu primeiro ativo para começar a acompanhar sua carteira.'
              : 'Nenhum ativo corresponde aos filtros aplicados.'}
          </p>
          <button type="button" onClick={openNew} className="atlas-btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Investimento
          </button>
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((a) => (
            <StaggerItem key={a.id}>
              <AssetCard asset={a} onClick={openAsset} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <AssetSheet open={sheetOpen} onOpenChange={setSheetOpen} asset={selected} />
    </DashboardLayout>
  );
}