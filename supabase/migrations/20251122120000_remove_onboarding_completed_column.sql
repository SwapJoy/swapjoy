-- Remove onboarding_completed column from users table
-- We now rely on username presence to determine if onboarding is complete

-- Drop the column (IF EXISTS ensures it won't fail if already dropped)
ALTER TABLE users
DROP COLUMN IF EXISTS onboarding_completed;

