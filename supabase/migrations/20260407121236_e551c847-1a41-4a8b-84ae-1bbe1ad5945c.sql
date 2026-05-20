-- Revoke UPDATE on sensitive columns from authenticated and anon
REVOKE UPDATE (has_access, subscription_plan, subscription_status,
  stripe_customer_id, stripe_subscription_id,
  subscription_ends_at, subscription_started_at, subscription_period)
ON public.profiles FROM authenticated, anon;

-- Drop the current complex WITH CHECK policy
DROP POLICY "Users can update own profile safe fields" ON public.profiles;

-- Create a simpler UPDATE policy since column-level REVOKE handles protection
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);