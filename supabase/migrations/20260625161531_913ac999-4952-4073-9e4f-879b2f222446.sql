GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.installments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_limits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.transactions TO service_role;
GRANT ALL ON public.recurring_expenses TO service_role;
GRANT ALL ON public.installments TO service_role;
GRANT ALL ON public.category_limits TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.reminders TO service_role;