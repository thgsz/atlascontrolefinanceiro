
-- Drop the existing overly permissive UPDATE policy
DROP POLICY "Users can update own profile" ON public.profiles;

-- Create a restricted UPDATE policy that only allows updating safe columns
-- by using WITH CHECK to prevent modification of subscription/payment fields
CREATE POLICY "Users can update own profile safe fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND has_access = (SELECT p.has_access FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_plan = (SELECT p.subscription_plan FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_status = (SELECT p.subscription_status FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_started_at IS NOT DISTINCT FROM (SELECT p.subscription_started_at FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_ends_at IS NOT DISTINCT FROM (SELECT p.subscription_ends_at FROM public.profiles p WHERE p.user_id = auth.uid())
  AND subscription_period IS NOT DISTINCT FROM (SELECT p.subscription_period FROM public.profiles p WHERE p.user_id = auth.uid())
  AND stripe_customer_id IS NOT DISTINCT FROM (SELECT p.stripe_customer_id FROM public.profiles p WHERE p.user_id = auth.uid())
  AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT p.stripe_subscription_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- Add DELETE policy for GDPR compliance
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);
