# Supabase Authentication Setup

## Overview
Supabase provides a complete authentication system via the `auth` schema. The `auth.users` table stores authentication credentials, while our `public.users` table stores profile information.

## Authentication Providers

### Enabled Providers:
1. **Email/Password** (Email + password authentication)
2. **Phone** (Phone number + OTP)
3. **Google OAuth**
4. **Apple OAuth**
5. **Facebook OAuth**

## How Supabase Auth Works

### Auth Schema (Managed by Supabase)
```sql
-- This is managed by Supabase, you don't create this
auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR,
  phone VARCHAR,
  encrypted_password VARCHAR, -- Supabase handles password hashing
  email_confirmed_at TIMESTAMP,
  phone_confirmed_at TIMESTAMP,
  raw_app_meta_data JSONB, -- { provider: 'email' | 'phone' | 'google' | 'apple' | 'facebook' }
  raw_user_meta_data JSONB, -- Custom user data from signup
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  ...
)
```

### Your Public Schema
```sql
-- Your users table (public.users)
-- Linked to auth.users via id
public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR,
  phone_number VARCHAR,
  ...
)
```

## Authentication Flow

### 1. Email/Password Signup
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securePassword123!',
  options: {
    data: {
      username: 'john_doe', // Will be used to create public.users record
      first_name: 'John',
      last_name: 'Doe',
    }
  }
})
// Supabase creates record in auth.users
// Your trigger creates record in public.users
```

### 2. Phone Number Signup
```typescript
const { data, error } = await supabase.auth.signUp({
  phone: '+1234567890',
  password: 'securePassword123!',
  options: {
    data: {
      username: 'john_doe',
      first_name: 'John',
      last_name: 'Doe',
    }
  }
})
// SMS with OTP sent
// User verifies with OTP
```

### 3. Google OAuth
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'swapjoy://auth/callback',
  }
})
// Google handles authentication
// User data automatically synced
```

### 4. Apple Sign In
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: 'swapjoy://auth/callback',
  }
})
```

### 5. Facebook OAuth
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'facebook',
  options: {
    redirectTo: 'swapjoy://auth/callback',
  }
})
```

## Database Trigger: Create Profile on Signup

This trigger automatically creates a `public.users` record when someone signs up:

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    username,
    email,
    phone_number,
    first_name,
    last_name,
    email_verified,
    phone_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email_confirmed_at IS NOT NULL,
    NEW.phone_confirmed_at IS NOT NULL
  );
  
  -- Create user stats record
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  -- Create user ratings record
  INSERT INTO public.user_ratings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Sync Auth Data to Public Users

Keep email/phone verification status in sync:

```sql
-- Function to sync auth updates to public.users
CREATE OR REPLACE FUNCTION public.sync_user_auth_data()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    phone_number = NEW.phone,
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    phone_verified = NEW.phone_confirmed_at IS NOT NULL,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: on auth.users update
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_auth_data();
```

## FAQ

### Q: Do I need to store password_hash in public.users?
**A: No!** Supabase stores `encrypted_password` in `auth.users`. You should NEVER store passwords in your public schema. Supabase handles all password hashing and verification.

### Q: What is oauth_provider_id used for?
**A: You don't need it!** Supabase stores OAuth provider information in `auth.users.raw_app_meta_data`. The `provider` field tells you which method was used:
```json
{
  "provider": "google",
  "providers": ["google"]
}
```

You can check the provider like this:
```typescript
const { data: { user } } = await supabase.auth.getUser()
const provider = user?.app_metadata?.provider // 'email', 'phone', 'google', 'apple', 'facebook'
```

### Q: How do I check if a user signed up with Google vs Email?
**A:** Query the `auth.users` table or check user metadata:
```sql
-- Via SQL
SELECT 
  u.id,
  u.email,
  au.raw_app_meta_data->>'provider' as auth_provider
FROM public.users u
JOIN auth.users au ON au.id = u.id
WHERE u.id = 'user-uuid';

-- Via Supabase client
const { data: { user } } = await supabase.auth.getUser()
console.log(user.app_metadata.provider) // 'google', 'email', 'phone', etc.
```

### Q: Can a user have multiple auth methods?
**A:** Yes! A user can link multiple providers. For example, sign up with email, then link Google account later:
```typescript
await supabase.auth.linkIdentity({ provider: 'google' })
```

### Q: How do I handle username uniqueness?
**A:** The `username` field has a UNIQUE constraint. Check availability before signup:
```typescript
const { data, error } = await supabase
  .from('users')
  .select('username')
  .eq('username', 'john_doe')
  .single()

if (data) {
  // Username taken
} else {
  // Username available
}
```

Or use a username generator in the trigger if user doesn't provide one (shown in trigger above).

## Row Level Security (RLS)

Enable RLS on users table:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can view public profiles (for browsing)
CREATE POLICY "Public profiles are viewable"
  ON public.users FOR SELECT
  USING (status = 'active');

-- Prevent users from inserting directly (handle via trigger)
CREATE POLICY "Prevent direct insert"
  ON public.users FOR INSERT
  WITH CHECK (false);
```

## Supabase Dashboard Configuration

### Enable Authentication Providers

1. **Go to:** Supabase Dashboard → Authentication → Providers

2. **Email:**
   - Already enabled by default
   - Configure email templates (optional)
   - Set confirmation URL: `swapjoy://auth/confirm`

3. **Phone:**
   - Enable Phone provider
   - Choose SMS provider (Twilio, MessageBird, etc.)
   - Add credentials
   - Set confirmation URL: `swapjoy://auth/confirm`

4. **Google:**
   - Enable Google provider
   - Add Client ID (from Google Cloud Console)
   - Add Client Secret
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

5. **Apple:**
   - Enable Apple provider
   - Add Services ID
   - Add Key ID and Private Key
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

6. **Facebook:**
   - Enable Facebook provider
   - Add Facebook App ID
   - Add Facebook App Secret
   - Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## Security Best Practices

1. ✅ **Never store passwords** in public.users
2. ✅ **Use auth.users** for all authentication data
3. ✅ **Enable RLS** on all tables
4. ✅ **Validate username** before creating user
5. ✅ **Use triggers** to keep data in sync
6. ✅ **Hash sensitive data** if needed (but password is already handled)
7. ✅ **Verify email/phone** before allowing certain actions

