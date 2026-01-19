-- Ensure username is never auto-generated
-- This migration ensures that the sync_auth_user_to_users function
-- does NOT auto-generate usernames - username must be set during onboarding

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

  -- CRITICAL: Only set username if explicitly provided in metadata
  -- DO NOT auto-generate username - it must be set during onboarding
  resolved_username := NULLIF(
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      raw_meta->>'username'
    ),
    ''
  );

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
    resolved_username, -- Can be NULL - user must set it during onboarding
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
    SET username = COALESCE(EXCLUDED.username, u.username), -- Only update if provided, keep existing otherwise
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








