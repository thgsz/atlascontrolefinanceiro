
-- Add has_access boolean column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_access boolean NOT NULL DEFAULT false;

-- Sync existing data: users with subscription_status = 'active' get has_access = true
UPDATE public.profiles SET has_access = true WHERE subscription_status = 'active';
