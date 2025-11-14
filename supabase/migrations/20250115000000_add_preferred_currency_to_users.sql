-- Add preferred_currency column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';

-- Set USD for all existing users
UPDATE public.users
SET preferred_currency = 'USD'
WHERE preferred_currency IS NULL;

-- Make the column NOT NULL after backfilling
ALTER TABLE public.users
ALTER COLUMN preferred_currency SET NOT NULL;

