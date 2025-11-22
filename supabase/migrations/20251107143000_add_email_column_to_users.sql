-- Add nullable email column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email TEXT;

-- Ensure email column allows NULL explicitly (safety for existing deployments)
ALTER TABLE public.users
ALTER COLUMN email DROP NOT NULL;

-- Backfill emails from auth.users when available
UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE u.email IS NULL
  AND au.id = u.id
  AND au.email IS NOT NULL;






