import { useState } from 'react';
import { DashboardLayout } from '@/components/atlas/DashboardLayout';
import { MonthSelector } from '@/components/atlas/MonthSelector';
import { AddTransactionDialog } from '@/components/atlas/AddTransactionDialog';
import { EditTransactionDialog } from '@/components/atlas/EditTransactionDialog';
import { TransactionItem } from '@/components/atlas/TransactionItem';
import { useTransactions, useDeleteTransaction, Transaction } from '@/hooks/useTransactions';
import { Search, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StaggerList, StaggerItem } from '@/components/motion/StaggerList';
import { MotionCard } from '@/components/motion/MotionCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePrivacy } from '@/lib/privacy-context';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Transactions() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: transactions = [], isLoading } = useTransactions(selectedMonth, selectedYear);
  const deleteTransaction = useDeleteTransaction();
  const isMobile = useIsMobile();
  const { maskCurrency } = usePrivacy();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || t.type === filter;
    return matchesSearch && matchesFilter;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const hasTransactions = filteredTransactions.length > 0;
  const hasAnyTransactions = transactions.length > 0;

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setEditOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction.mutateAsync(deleteId);
      toast.success('🗑 Transação removida');
    } catch {
      toast.error('Erro ao excluir transação');
    }
    setDeleteId(null);
  };

  return (
    <DashboardLayout>
      <div className="px-4 md:px-0 pb-28 md:pb-0">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-display text-xl md:text-2xl font-bold">Transações</h1>
            {!isMobile && <AddTransactionDialog />}
          </div>
          <div className="flex justify-center">
            <MonthSelector
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
            />
          </div>
          {!isMobile && (
            <p className="text-muted-foreground text-sm mt-2">Gerencie suas receitas e despesas</p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="space-y-3 mb-4 md:mb-6">
          <div className="grid grid-cols-2 gap-3">
            <MotionCard delay={0}>
              <div className="atlas-card p-3 md:p-4 border-border/30">
                <p className="text-xs text-muted-foreground mb-0.5">Receitas</p>
                <p className="text-base md:text-xl font-display font-bold text-atlas-income-light transition-all duration-200">
                  {maskCurrency(totalIncome)}
                </p>
              </div>
            </MotionCard>
            <MotionCard delay={0.1}>
              <div className="atlas-card p-3 md:p-4 border-border/30">
                <p className="text-xs text-muted-foreground mb-0.5">Despesas</p>
                <p className="text-base md:text-xl font-display font-bold text-atlas-expense-light transition-all duration-200">
                  {maskCurrency(totalExpenses)}
                </p>
              </div>
            </MotionCard>
          </div>
          <MotionCard delay={0.2}>
            <div className="atlas-card p-4 md:p-5 border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Balanço</p>
              <p className={cn(
                'text-lg md:text-2xl font-display font-bold transition-all duration-200',
                balance >= 0 ? 'text-primary' : 'text-destructive'
              )}>
                {maskCurrency(balance)}
              </p>
            </div>
          </MotionCard>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar transações..."
              className="atlas-input pl-10 py-2.5 text-sm"
            />
          </div>

          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg self-start">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  'px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-md transition-colors',
                  filter === type
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {type === 'all' && 'Todas'}
                {type === 'income' && 'Receitas'}
                {type === 'expense' && 'Despesas'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="atlas-card p-3 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/60"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          ) : !hasTransactions ? (
            <div className="flex flex-col items-center justify-center py-14 md:py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/60 flex items-center justify-center mb-4">
                <Receipt className="w-7 h-7 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-foreground/80 mb-1">
                Nenhuma transação encontrada
              </p>
              <p className="text-xs text-muted-foreground mb-6 max-w-[260px]">
                {search || filter !== 'all'
                  ? 'Tente alterar os filtros de busca.'
                  : 'Adicione sua primeira transação para começar a organizar suas finanças.'}
              </p>
              {!search && filter === 'all' && (
                <AddTransactionDialog />
              )}
            </div>
          ) : (
            <StaggerList className="space-y-1">
              {filteredTransactions.map((transaction) => (
                <StaggerItem key={transaction.id}>
                  <div
                    onClick={() => handleEdit(transaction)}
                    className="cursor-pointer"
                  >
                    <TransactionItem transaction={transaction} />
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </div>
      </div>

      {/* FAB only when there are transactions */}
      {isMobile && hasAnyTransactions && <AddTransactionDialog variant="fab" />}

      {/* Edit Dialog */}
      <EditTransactionDialog
        transaction={editTransaction}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta transação?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
