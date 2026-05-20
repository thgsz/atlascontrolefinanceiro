-- Drop old enum and create new one for subscription plans (monthly/annual only)
-- First, update existing profiles to 'monthly' as default
UPDATE public.profiles SET subscription_plan = 'free' WHERE subscription_plan IS NULL;

-- Create installments table for tracking parcelas
CREATE TABLE public.installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  installment_amount NUMERIC NOT NULL,
  total_installments INTEGER NOT NULL,
  current_installment INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on installments
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

-- RLS policies for installments
CREATE POLICY "Users can view own installments" ON public.installments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own installments" ON public.installments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own installments" ON public.installments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own installments" ON public.installments FOR DELETE USING (auth.uid() = user_id);

-- Create category_limits table for spending limits
CREATE TABLE public.category_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Enable RLS on category_limits
ALTER TABLE public.category_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for category_limits
CREATE POLICY "Users can view own category limits" ON public.category_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own category limits" ON public.category_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own category limits" ON public.category_limits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own category limits" ON public.category_limits FOR DELETE USING (auth.uid() = user_id);

-- Create subscriptions table for tracking recurring subscriptions (Assinaturas)
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  billing_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Add subscription_status and billing fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_period TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.installments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.category_limits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;