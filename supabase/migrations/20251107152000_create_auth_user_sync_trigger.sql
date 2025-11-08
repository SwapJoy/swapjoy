-- Sync auth.users changes into public.users

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure required columns exist on public.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Align defaults for timestamp columns if they already existed without defaults
ALTER TABLE public.users
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.sync_auth_user_to_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_meta JSONB := NEW.raw_user_meta_data;
  full_name TEXT := COALESCE(raw_meta->>'full_name', raw_meta->>'name', raw_meta->>'display_name');
  resolved_first_name TEXT := NULLIF(COALESCE(raw_meta->>'first_name', raw_meta->>'given_name'), '');
  resolved_last_name TEXT := NULLIF(COALESCE(raw_meta->>'last_name', raw_meta->>'family_name'), '');
  resolved_email TEXT := NULLIF(NEW.email, '');
  resolved_phone TEXT := NULLIF(NEW.phone, '');
  resolved_avatar TEXT := NULLIF(
    COALESCE(
      raw_meta->>'avatar_url',
      raw_meta->>'picture',
      raw_meta->>'profile_image_url'
    ),
    ''
  );
  resolved_username TEXT;
BEGIN
  IF resolved_first_name IS NULL AND full_name IS NOT NULL THEN
    resolved_first_name := split_part(full_name, ' ', 1);
  END IF;

  IF resolved_last_name IS NULL AND full_name IS NOT NULL THEN
    resolved_last_name := NULLIF(trim(BOTH ' ' FROM substr(full_name, length(split_part(full_name, ' ', 1)) + 2)), '');
  END IF;

  resolved_username := NULLIF(
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      raw_meta->>'username',
      CASE
        WHEN resolved_email IS NOT NULL THEN split_part(resolved_email, '@', 1)
        ELSE NULL
      END
    ),
    ''
  );

  IF resolved_username IS NULL THEN
    resolved_username := concat('user_', encode(gen_random_bytes(4), 'hex'));
  END IF;

  INSERT INTO public.users AS u (
    id,
    username,
    first_name,
    last_name,
    email,
    email_verified,
    phone,
    phone_verified,
    profile_image_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    resolved_username,
    COALESCE(resolved_first_name, 'User'),
    COALESCE(resolved_last_name, ''),
    resolved_email,
    (NEW.email_confirmed_at IS NOT NULL),
    resolved_phone,
    (NEW.phone_confirmed_at IS NOT NULL),
    resolved_avatar,
    COALESCE((SELECT created_at FROM public.users WHERE id = NEW.id), NOW()),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        email_verified = EXCLUDED.email_verified,
        phone = EXCLUDED.phone,
        phone_verified = EXCLUDED.phone_verified,
        profile_image_url = EXCLUDED.profile_image_url,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_auth_user_to_users ON auth.users;

CREATE TRIGGER sync_auth_user_to_users
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.sync_auth_user_to_users();

-- Backfill existing auth users into public.users
WITH src AS (
  SELECT
    au.id,
    au.raw_user_meta_data AS raw_meta,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name') AS full_name,
    au.email AS raw_email,
    au.phone AS raw_phone,
    NULLIF(au.email, '') AS email,
    (au.email_confirmed_at IS NOT NULL) AS email_verified,
    NULLIF(au.phone, '') AS phone,
    (au.phone_confirmed_at IS NOT NULL) AS phone_verified,
    NULLIF(
      COALESCE(
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'picture',
        au.raw_user_meta_data->>'profile_image_url'
      ),
      ''
    ) AS profile_image_url,
    NOW() AS updated_at
  FROM auth.users au
)
INSERT INTO public.users (
  id,
  username,
  first_name,
  last_name,
  email,
  email_verified,
  phone,
  phone_verified,
  profile_image_url,
  created_at,
  updated_at
)
SELECT
  src.id,
  COALESCE(
    NULLIF(src.raw_meta->>'username', ''),
    CASE WHEN NULLIF(src.raw_email, '') IS NOT NULL THEN split_part(src.raw_email, '@', 1) END,
    concat('user_', encode(gen_random_bytes(4), 'hex'))
  ) AS username,
  COALESCE(
    NULLIF(src.raw_meta->>'first_name', ''),
    NULLIF(src.raw_meta->>'given_name', ''),
    CASE WHEN src.full_name IS NOT NULL THEN split_part(src.full_name, ' ', 1) END,
    'User'
  ) AS first_name,
  COALESCE(
    NULLIF(src.raw_meta->>'last_name', ''),
    NULLIF(src.raw_meta->>'family_name', ''),
    CASE
      WHEN src.full_name IS NOT NULL
      THEN NULLIF(trim(BOTH ' ' FROM substr(src.full_name, length(split_part(src.full_name, ' ', 1)) + 2)), '')
    END,
    ''
  ) AS last_name,
  src.email,
  src.email_verified,
  src.phone,
  src.phone_verified,
  src.profile_image_url,
  NOW(),
  src.updated_at
FROM src
ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      email_verified = EXCLUDED.email_verified,
      phone = EXCLUDED.phone,
      phone_verified = EXCLUDED.phone_verified,
      profile_image_url = EXCLUDED.profile_image_url,
      updated_at = EXCLUDED.updated_at;

