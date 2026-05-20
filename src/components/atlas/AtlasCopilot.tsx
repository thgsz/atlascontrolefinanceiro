import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type Msg = { role: 'user' | 'assistant'; content: string };

interface FinancialData {
  monthlyExpenses: number;
  monthlyIncome: number;
  topCategory: string;
  topCategoryValue: number;
  topCategoryPercent: number;
  biggestExpense: number;
  biggestExpenseDesc: string;
  biggestExpenseCategory: string;
  dailyAverage: number;
  transactionCount: number;
  previousMonthExpenses: number;
  expensesByCategory: Record<string, number>;
  balance: number;
}

const SUGGESTIONS = [
  'Quanto gastei este mês?',
  'Qual meu maior gasto?',
  'Qual categoria gasto mais?',
  'Como posso economizar?',
];

function atlasCopilotReply(message: string, data: FinancialData): string {
  const msg = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  // Spending this month
  if (msg.match(/quanto.*gast|total.*gasto|gasto.*mes|despesa.*mes|quanto.*spend/)) {
    const comparison = data.previousMonthExpenses > 0
      ? data.monthlyExpenses > data.previousMonthExpenses
        ? `📈 Isso representa um aumento de ${(((data.monthlyExpenses - data.previousMonthExpenses) / data.previousMonthExpenses) * 100).toFixed(0)}% em relação ao mês passado.`
        : `📉 Isso representa uma redução de ${(((data.previousMonthExpenses - data.monthlyExpenses) / data.previousMonthExpenses) * 100).toFixed(0)}% em relação ao mês passado.`
      : '';
    return `💰 Este mês você gastou **${fmt(data.monthlyExpenses)}** em ${data.transactionCount} transações.\n\nSua média diária de gastos é de **${fmt(data.dailyAverage)}**.\n\n${comparison}`.trim();
  }

  // Biggest expense
  if (msg.match(/maior.*gasto|maior.*despesa|biggest|maior.*transac/)) {
    if (data.biggestExpense === 0) return '✨ Você ainda não tem gastos registrados este mês!';
    return `🔍 Seu maior gasto este mês foi de **${fmt(data.biggestExpense)}**${data.biggestExpenseDesc ? ` — *${data.biggestExpenseDesc}*` : ''}${data.biggestExpenseCategory ? ` na categoria **${data.biggestExpenseCategory}**` : ''}.`;
  }

  // Top category
  if (msg.match(/categori|onde.*gast|mais.*gast|qual.*gasto.*mais|dominan/)) {
    if (!data.topCategory) return '✨ Sem dados de categorias para analisar ainda.';
    const otherCategories = Object.entries(data.expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(1, 4)
      .map(([name, val]) => `• ${name}: ${fmt(val)}`)
      .join('\n');
    return `📊 A categoria em que você mais gasta é **${data.topCategory}**, com **${fmt(data.topCategoryValue)}** (${data.topCategoryPercent.toFixed(0)}% do total).\n\n${otherCategories ? `Outras categorias relevantes:\n${otherCategories}` : ''}`.trim();
  }

  // Save money / tips
  if (msg.match(/economiz|salvar|poupar|dica|tip|reduz|save|cortar/)) {
    if (!data.topCategory) return '💡 Registre suas transações para que eu possa analisar onde você pode economizar!';
    const projectedMonthly = data.dailyAverage * 30;
    return `💡 **Dicas para economizar:**\n\n1. Sua maior categoria de gastos é **${data.topCategory}** (${fmt(data.topCategoryValue)}). Tente reduzir em 20% para economizar **${fmt(data.topCategoryValue * 0.2)}** por mês.\n\n2. Sua média diária é **${fmt(data.dailyAverage)}**. Se manter esse ritmo, a projeção para o mês é **${fmt(projectedMonthly)}**.\n\n3. Revise gastos recorrentes e cancele serviços que não usa.\n\n4. Defina limites por categoria na aba **Limites** do app.`;
  }

  // Balance / income
  if (msg.match(/saldo|balanc|sobr|receita|ganho|income/)) {
    return `💰 **Resumo do mês:**\n\n• Receitas: **${fmt(data.monthlyIncome)}**\n• Despesas: **${fmt(data.monthlyExpenses)}**\n• Saldo: **${fmt(data.balance)}**\n\n${data.balance >= 0 ? '✅ Você está no positivo!' : '⚠️ Atenção: seus gastos superaram suas receitas este mês.'}`;
  }

  // Daily average
  if (msg.match(/media.*diari|diaria|average|media.*gasto/)) {
    return `📅 Sua média diária de gastos este mês é de **${fmt(data.dailyAverage)}**.\n\nSe manter esse ritmo, a projeção para o mês completo é **${fmt(data.dailyAverage * 30)}**.`;
  }

  // Comparison with previous month
  if (msg.match(/comparac|anterior|passado|mes.*anterior|previous|compara/)) {
    if (data.previousMonthExpenses === 0) return '📊 Sem dados do mês anterior para comparar.';
    const diff = data.monthlyExpenses - data.previousMonthExpenses;
    const pct = ((diff / data.previousMonthExpenses) * 100).toFixed(0);
    const direction = diff > 0 ? `📈 Aumento de ${pct}%` : `📉 Redução de ${Math.abs(Number(pct))}%`;
    return `📊 **Comparação mensal:**\n\n• Este mês: **${fmt(data.monthlyExpenses)}**\n• Mês passado: **${fmt(data.previousMonthExpenses)}**\n\n${direction} em relação ao mês anterior.`;
  }

  // Greeting
  if (msg.match(/^(oi|ola|hey|hi|hello|bom dia|boa tarde|boa noite|e ai)/)) {
    return `👋 Olá! Sou o **Atlas Copilot**, seu assistente financeiro.\n\nPosso te ajudar com:\n• Resumo de gastos do mês\n• Análise por categoria\n• Dicas para economizar\n• Comparação com mês anterior\n\nO que deseja saber?`;
  }

  // Fallback
  return `🤔 Não entendi sua pergunta. Tente perguntar algo como:\n\n• *"Quanto gastei este mês?"*\n• *"Qual meu maior gasto?"*\n• *"Qual categoria gasto mais?"*\n• *"Como posso economizar?"*\n• *"Qual meu saldo?"*`;
}

function CopilotChat({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const { data: transactions = [] } = useTransactions(now.getMonth() + 1, now.getFullYear());
  const { data: categories = [] } = useCategories();

  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevEnd = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0];

  const { data: prevTransactions = [] } = useQuery({
    queryKey: ['transactions', user?.id, prevMonth, prevYear],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*, category:categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .gte('date', prevStart)
        .lte('date', prevEnd);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const financialData = useMemo<FinancialData>(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const incomes = transactions.filter((t) => t.type === 'income');
    const totalExpenses = expenses.reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
    const prevExpenses = (prevTransactions as any[]).filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + Number(t.amount), 0);

    const dayOfMonth = now.getDate();
    const dailyAvg = dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;

    const byCat: Record<string, number> = {};
    expenses.forEach((t) => {
      const name = t.category?.name || 'Sem categoria';
      byCat[name] = (byCat[name] || 0) + Number(t.amount);
    });

    const topEntry = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    const biggest = expenses.sort((a, b) => Number(b.amount) - Number(a.amount))[0];

    return {
      monthlyExpenses: totalExpenses,
      monthlyIncome: totalIncome,
      topCategory: topEntry?.[0] || '',
      topCategoryValue: topEntry?.[1] || 0,
      topCategoryPercent: totalExpenses > 0 && topEntry ? (topEntry[1] / totalExpenses) * 100 : 0,
      biggestExpense: biggest ? Number(biggest.amount) : 0,
      biggestExpenseDesc: biggest?.description || '',
      biggestExpenseCategory: biggest?.category?.name || '',
      dailyAverage: dailyAvg,
      transactionCount: transactions.length,
      previousMonthExpenses: prevExpenses,
      expensesByCategory: byCat,
      balance: totalIncome - totalExpenses,
    };
  }, [transactions, prevTransactions]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: 'user', content: text.trim() };
    const reply = atlasCopilotReply(text.trim(), financialData);
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: reply }]);
    setInput('');
  }, [financialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex flex-col bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--atlas-bg-deep))] border border-border/50 shadow-2xl overflow-hidden z-[60]',
        isMobile ? 'fixed inset-0' : 'fixed bottom-24 right-5 w-full max-w-[420px] h-[560px] rounded-2xl'
      )}
      style={!isMobile ? { backdropFilter: 'blur(20px)' } : undefined}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Atlas Copilot</h3>
            <p className="text-xs text-muted-foreground">Seu assistente financeiro</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary/80 transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Olá! Sou o Atlas Copilot</p>
              <p className="text-xs text-muted-foreground">Pergunte sobre seus gastos, categorias ou peça dicas para economizar.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                msg.role === 'user'
                  ? 'bg-primary/20 text-foreground rounded-br-md'
                  : 'bg-secondary/60 text-foreground rounded-bl-md'
              )}
            >
              {msg.role === 'assistant' ? (
                <span dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br/>')
                }} />
              ) : msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border/30 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ao Atlas sobre suas finanças..."
          className="flex-1 bg-secondary/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

export function AtlasCopilot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && <CopilotChat onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'fixed bottom-5 right-5 z-50 rounded-full flex items-center justify-center',
              'bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--atlas-bg-deep))]',
              'border border-border/50 shadow-lg shadow-primary/10',
              'w-[52px] h-[52px] md:w-[56px] md:h-[56px]',
              'backdrop-blur-md'
            )}
            style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.15), 0 4px 12px rgba(0,0,0,0.3)' }}
          >
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 5.4 }}>
              <Bot className="w-6 h-6 text-primary" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
