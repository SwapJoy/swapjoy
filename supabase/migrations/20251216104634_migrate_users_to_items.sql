-- Migrate user data from users table to items.user column
-- This script copies user properties to the denormalized user column

BEGIN;

-- Update items.user with data from users table
UPDATE public.items i
SET "user" = jsonb_build_object(
  'username', u.username,
  'profile_image_url', u.profile_image_url,
  'firstname', u.first_name,
  'lastname', u.last_name
)
FROM users u
WHERE i.user_id = u.id
  AND i.user_id IS NOT NULL;

-- Set user to NULL for items with no user_id (shouldn't happen, but handle gracefully)
UPDATE public.items
SET "user" = NULL
WHERE user_id IS NULL;

COMMIT;

