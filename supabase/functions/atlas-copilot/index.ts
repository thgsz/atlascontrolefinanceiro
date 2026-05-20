import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Fetch financial data for context
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
    const prevEnd = new Date(prevYear, prevMonth, 0).toISOString().split("T")[0];

    const [txRes, prevTxRes, catRes, profileRes] = await Promise.all([
      supabase.from("transactions").select("*, category:categories(name, color)").eq("user_id", user.id).gte("date", startOfMonth).lte("date", endOfMonth),
      supabase.from("transactions").select("*, category:categories(name)").eq("user_id", user.id).gte("date", prevStart).lte("date", prevEnd),
      supabase.from("categories").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    ]);

    const transactions = txRes.data || [];
    const prevTransactions = prevTxRes.data || [];
    const categories = catRes.data || [];
    const profile = profileRes.data;

    const totalIncome = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const totalExpenses = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const prevExpenses = prevTransactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const dayOfMonth = now.getDate();
    const dailyAvg = dayOfMonth > 0 ? totalExpenses / dayOfMonth : 0;

    const expensesByCategory: Record<string, number> = {};
    transactions.filter((t: any) => t.type === "expense").forEach((t: any) => {
      const name = (t.category as any)?.name || "Sem categoria";
      expensesByCategory[name] = (expensesByCategory[name] || 0) + Number(t.amount);
    });

    const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];
    const biggestExpense = transactions.filter((t: any) => t.type === "expense").sort((a: any, b: any) => Number(b.amount) - Number(a.amount))[0];

    const financialContext = `
You are Atlas Copilot, a friendly and intelligent financial assistant for the Atlas Finance app. You speak Portuguese (Brazil).
Always be concise, helpful, and use financial data to give personalized answers. Use R$ for currency. Format numbers with Brazilian notation.

CURRENT MONTH FINANCIAL SUMMARY:
- Total income: R$${totalIncome.toFixed(2)}
- Total expenses: R$${totalExpenses.toFixed(2)}
- Balance: R$${(totalIncome - totalExpenses).toFixed(2)}
- Daily average spending: R$${dailyAvg.toFixed(2)}
- Day of month: ${dayOfMonth}
- Previous month expenses: R$${prevExpenses.toFixed(2)}
${topCategory ? `- Top spending category: ${topCategory[0]} (R$${topCategory[1].toFixed(2)}, ${totalExpenses > 0 ? ((topCategory[1] / totalExpenses) * 100).toFixed(0) : 0}% of total)` : ""}
${biggestExpense ? `- Biggest expense: R$${Number(biggestExpense.amount).toFixed(2)} - ${biggestExpense.description || "sem descrição"} (${(biggestExpense.category as any)?.name || "sem categoria"})` : ""}
- Number of transactions this month: ${transactions.length}
- Categories: ${categories.map((c: any) => c.name).join(", ")}
${profile?.monthly_income ? `- User monthly income goal: R$${Number(profile.monthly_income).toFixed(2)}` : ""}
${profile?.full_name ? `- User name: ${profile.full_name}` : ""}

EXPENSES BY CATEGORY:
${Object.entries(expensesByCategory).map(([name, val]) => `- ${name}: R$${val.toFixed(2)}`).join("\n")}

RECENT TRANSACTIONS (last 10):
${transactions.slice(0, 10).map((t: any) => `- ${t.date} | ${t.type} | R$${Number(t.amount).toFixed(2)} | ${t.description || "sem descrição"} | ${(t.category as any)?.name || "sem categoria"}`).join("\n")}

Rules:
- Answer ONLY about financial topics related to the user's data
- Be encouraging and suggest ways to save money when appropriate
- If the user asks something unrelated to finances, politely redirect
- Keep responses under 200 words
- Use emojis sparingly for friendliness
`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: financialContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao conectar com o assistente." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("atlas-copilot error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
