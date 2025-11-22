-- Add onboarding-related fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN users.birth_date IS 'User birthdate for age verification and personalization';
COMMENT ON COLUMN users.gender IS 'User gender: male, female, other, prefer_not_to_say';
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed the post-signin onboarding flow';

