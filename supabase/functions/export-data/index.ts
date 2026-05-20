import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-DATA] ${step}${detailsStr}`);
};

function convertToCSV(data: Record<string, unknown>[], headers: string[]): string {
  if (data.length === 0) return headers.join(',') + '\n';
  
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  return headers.join(',') + '\n' + rows.join('\n');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Fetch all user data
    const [transactionsRes, categoriesRes, subscriptionsRes, installmentsRes, recurringRes] = await Promise.all([
      supabaseClient.from('transactions').select('*').eq('user_id', user.id),
      supabaseClient.from('categories').select('*').eq('user_id', user.id),
      supabaseClient.from('subscriptions').select('*').eq('user_id', user.id),
      supabaseClient.from('installments').select('*').eq('user_id', user.id),
      supabaseClient.from('recurring_expenses').select('*').eq('user_id', user.id),
    ]);

    logStep("Data fetched", {
      transactions: transactionsRes.data?.length || 0,
      categories: categoriesRes.data?.length || 0,
      subscriptions: subscriptionsRes.data?.length || 0,
      installments: installmentsRes.data?.length || 0,
      recurring: recurringRes.data?.length || 0,
    });

    // Generate CSVs
    const transactionsCsv = convertToCSV(
      transactionsRes.data || [],
      ['id', 'date', 'description', 'amount', 'type', 'category_id', 'is_recurring', 'created_at']
    );
    
    const categoriesCsv = convertToCSV(
      categoriesRes.data || [],
      ['id', 'name', 'icon', 'color', 'is_default', 'created_at']
    );
    
    const subscriptionsCsv = convertToCSV(
      subscriptionsRes.data || [],
      ['id', 'name', 'amount', 'billing_day', 'category_id', 'is_active', 'created_at']
    );
    
    const installmentsCsv = convertToCSV(
      installmentsRes.data || [],
      ['id', 'description', 'total_amount', 'installment_amount', 'total_installments', 'current_installment', 'start_date', 'category_id', 'created_at']
    );
    
    const recurringCsv = convertToCSV(
      recurringRes.data || [],
      ['id', 'name', 'amount', 'day_of_month', 'category_id', 'is_active', 'created_at']
    );

    const exportData = {
      transactions: transactionsCsv,
      categories: categoriesCsv,
      subscriptions: subscriptionsCsv,
      installments: installmentsCsv,
      recurring_expenses: recurringCsv,
      exported_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(exportData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
