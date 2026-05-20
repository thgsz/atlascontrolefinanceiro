-- Revoke SELECT on sensitive stripe/billing columns from authenticated and anon roles
-- This prevents client-side access to billing internals while keeping the columns for server-side use

REVOKE SELECT (stripe_customer_id, stripe_subscription_id, subscription_started_at, subscription_ends_at, subscription_period)
ON public.profiles FROM authenticated, anon;

-- Re-grant SELECT on safe columns explicitly
GRANT SELECT (id, user_id, full_name, avatar_url, monthly_income, subscription_plan, subscription_status, has_access, onboarding_completed, created_at, updated_at)
ON public.profiles TO authenticated, anon;