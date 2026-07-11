import { useEffect, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  ASSET_TYPES,
  DIVIDEND_MOVEMENT_TYPES,
  INSTITUTION_SUGGESTIONS,
  MOVEMENT_TYPES,
  type AssetType,
  type MovementType,
} from '@/lib/investments-constants';
import {
  useCreateAsset,
  useCreateMovement,
  useDeleteAsset,
  useDeleteMovement,
  useInvestmentMovements,
  useUpdateAsset,
  type InvestmentAsset,
} from '@/hooks/useInvestments';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface AssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: InvestmentAsset | null;
}

interface FormState {
  institution: string;
  asset_type: AssetType;
  name: string;
  ticker: string;
  quantity: string;
  average_price: string;
  invested_amount: string;
  current_price: string;
  purchase_date: string;
  notes: string;
}

const emptyForm: FormState = {
  institution: '',
  asset_type: 'acoes',
  name: '',
  ticker: '',
  quantity: '',
  average_price: '',
  invested_amount: '',
  current_price: '',
  purchase_date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
};

export function AssetSheet({ open, onOpenChange, asset }: AssetSheetProps) {
  const [tab, setTab] = useState<'info' | 'movements'>('info');
  const [form, setForm] = useState<FormState>(emptyForm);
  const isEdit = !!asset;

  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  useEffect(() => {
    if (asset) {
      setForm({
        institution: asset.institution ?? '',
        asset_type: asset.asset_type,
        name: asset.name,
        ticker: asset.ticker ?? '',
        quantity: String(asset.quantity ?? ''),
        average_price: String(asset.average_price ?? ''),
        invested_amount: String(asset.invested_amount ?? ''),
        current_price: asset.current_price != null ? String(asset.current_price) : '',
        purchase_date: asset.purchase_date ?? format(new Date(), 'yyyy-MM-dd'),
        notes: asset.notes ?? '',
      });
    } else {
      setForm(emptyForm);
      setTab('info');
    }
  }, [asset, open]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // Auto-derive invested from qty * avg if user hasn't set it
  useEffect(() => {
    const q = parseFloat(form.quantity);
    const a = parseFloat(form.average_price);
    if (!isNaN(q) && !isNaN(a) && !form.invested_amount) {
      update('invested_amount', String((q * a).toFixed(2)));
    }
  }, [form.quantity, form.average_price]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!form.name && !form.ticker) {
      toast.error('Informe o nome ou ticker do ativo');
      return;
    }
    const payload = {
      institution: form.institution.trim(),
      asset_type: form.asset_type,
      name: form.name.trim() || form.ticker.trim().toUpperCase(),
      ticker: form.ticker.trim().toUpperCase() || null,
      quantity: parseFloat(form.quantity) || 0,
      average_price: parseFloat(form.average_price) || 0,
      invested_amount:
        parseFloat(form.invested_amount) ||
        (parseFloat(form.quantity) || 0) * (parseFloat(form.average_price) || 0),
      current_price: form.current_price ? parseFloat(form.current_price) : null,
      purchase_date: form.purchase_date || null,
      notes: form.notes.trim() || null,
    };
    try {
      if (isEdit && asset) {
        await updateAsset.mutateAsync({ id: asset.id, ...payload });
        toast.success('Investimento atualizado');
      } else {
        await createAsset.mutateAsync(payload);
        toast.success('Investimento adicionado');
      }
      onOpenChange(false);
    } catch (e) {
      toast.error('Erro ao salvar investimento');
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    if (!confirm('Excluir este investimento e todo o histórico?')) return;
    try {
      await deleteAsset.mutateAsync(asset.id);
      toast.success('Investimento excluído');
      onOpenChange(false);
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="atlas-card border-t border-border/60 rounded-t-2xl max-h-[92vh] overflow-y-auto p-0"
      >
        <div className="p-6">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="font-display">
              {isEdit ? asset?.ticker || asset?.name : 'Novo Investimento'}
            </SheetTitle>
          </SheetHeader>

          {isEdit && (
            <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-4 w-fit">
              <button
                type="button"
                onClick={() => setTab('info')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'info' ? 'bg-background text-foreground' : 'text-muted-foreground'
                }`}
              >
                Detalhes
              </button>
              <button
                type="button"
                onClick={() => setTab('movements')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === 'movements' ? 'bg-background text-foreground' : 'text-muted-foreground'
                }`}
              >
                Histórico
              </button>
            </div>
          )}

          {tab === 'info' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tipo">
                  <select
                    value={form.asset_type}
                    onChange={(e) => update('asset_type', e.target.value as AssetType)}
                    className="atlas-input w-full"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Instituição">
                  <input
                    list="institution-suggestions"
                    value={form.institution}
                    onChange={(e) => update('institution', e.target.value)}
                    placeholder="Banco / Corretora"
                    className="atlas-input w-full"
                  />
                  <datalist id="institution-suggestions">
                    {INSTITUTION_SUGGESTIONS.map((i) => (
                      <option key={i} value={i} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Ticker">
                  <input
                    value={form.ticker}
                    onChange={(e) => update('ticker', e.target.value)}
                    placeholder="Ex: PETR4"
                    className="atlas-input w-full uppercase"
                  />
                </Field>
                <Field label="Nome do Ativo">
                  <input
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Nome completo"
                    className="atlas-input w-full"
                  />
                </Field>
                <Field label="Quantidade">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    className="atlas-input w-full"
                  />
                </Field>
                <Field label="Preço Médio (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.average_price}
                    onChange={(e) => update('average_price', e.target.value)}
                    className="atlas-input w-full"
                  />
                </Field>
                <Field label="Valor Investido (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.invested_amount}
                    onChange={(e) => update('invested_amount', e.target.value)}
                    className="atlas-input w-full"
                  />
                </Field>
                <Field label="Preço Atual (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.current_price}
                    onChange={(e) => update('current_price', e.target.value)}
                    placeholder="Cotação atual"
                    className="atlas-input w-full"
                  />
                </Field>
                <Field label="Data">
                  <input
                    type="date"
                    value={form.purchase_date}
                    onChange={(e) => update('purchase_date', e.target.value)}
                    className="atlas-input w-full"
                  />
                </Field>
              </div>
              <Field label="Observações">
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  rows={2}
                  className="atlas-input w-full resize-none"
                />
              </Field>

              <div className="flex gap-2 pt-2">
                {isEdit && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors atlas-press"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={createAsset.isPending || updateAsset.isPending}
                  className="atlas-btn-primary flex-1"
                >
                  {createAsset.isPending || updateAsset.isPending
                    ? 'Salvando...'
                    : isEdit
                      ? 'Salvar Alterações'
                      : 'Adicionar Investimento'}
                </button>
              </div>
            </div>
          ) : (
            asset && <MovementsPanel assetId={asset.id} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function MovementsPanel({ assetId }: { assetId: string }) {
  const { data: movements = [] } = useInvestmentMovements(assetId);
  const create = useCreateMovement();
  const del = useDeleteMovement();

  const [type, setType] = useState<MovementType>('aporte');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [total, setTotal] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const isCashOnly = useMemo(
    () => DIVIDEND_MOVEMENT_TYPES.includes(type) || type === 'rendimento',
    [type]
  );

  const handleAdd = async () => {
    const q = parseFloat(qty) || 0;
    const p = parseFloat(price) || 0;
    const t = parseFloat(total) || q * p;
    if (t <= 0 && q <= 0) {
      toast.error('Informe pelo menos um valor');
      return;
    }
    try {
      await create.mutateAsync({
        asset_id: assetId,
        movement_type: type,
        quantity: q,
        unit_price: p,
        total_amount: t,
        movement_date: date,
      });
      setQty('');
      setPrice('');
      setTotal('');
      toast.success('Movimentação registrada');
    } catch {
      toast.error('Erro ao registrar');
    }
  };

  return (
    <div className="space-y-4">
      <div className="atlas-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MovementType)}
              className="atlas-input w-full"
            >
              {MOVEMENT_TYPES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="atlas-input w-full"
            />
          </Field>
          {!isCashOnly && (
            <>
              <Field label="Quantidade">
                <input
                  type="number"
                  step="any"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="atlas-input w-full"
                />
              </Field>
              <Field label="Preço (R$)">
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="atlas-input w-full"
                />
              </Field>
            </>
          )}
          <Field label="Valor Total (R$)">
            <input
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="atlas-input w-full"
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={create.isPending}
          className="atlas-btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {create.isPending ? 'Salvando...' : 'Registrar'}
        </button>
      </div>

      <div className="space-y-2">
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma movimentação registrada
          </p>
        ) : (
          movements.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
            >
              <div>
                <p className="text-sm font-medium capitalize">{m.movement_type.replace('_', ' ')}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(m.movement_date + 'T00:00'), 'dd/MM/yyyy')}
                  {Number(m.quantity) > 0 ? ` · ${Number(m.quantity)} un` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  {Number(m.total_amount).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => del.mutate(m.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}