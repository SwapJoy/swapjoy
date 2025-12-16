# Enable Anonymous Sign-Ins in Supabase

## Quick Fix

Anonymous sign-ins need to be enabled in your Supabase project dashboard.

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Scroll down to find **Anonymous** provider
4. Toggle it **ON** (Enable)
5. Save the changes

### Option 2: Via Supabase CLI

If you have Supabase CLI configured:

```bash
# Link to your project (if not already linked)
supabase link --project-ref glbvyusqksnoyjuztceo

# Update the config
supabase db remote commit
```

Then update your local `config.toml`:

```toml
[auth]
enable_anonymous_sign_ins = true
```

And push the changes:

```bash
supabase db push
```

### Option 3: Via SQL (Direct Database Access)

If you have direct database access, you can run:

```sql
-- This is typically managed via the dashboard, but if needed:
-- Check current auth config
SELECT * FROM auth.config;

-- Note: Anonymous sign-ins are usually enabled via the dashboard UI
-- The setting is stored in Supabase's internal configuration
```

## Verification

After enabling, test by:

1. Restart your app
2. Check the console logs - you should see:
   ```
   [AuthContext] Anonymous sign-in successful
   ```
3. The app should now allow browsing without requiring sign-in

## Rate Limits

Anonymous sign-ins have rate limits configured:
- **30 anonymous sign-ins per hour per IP address** (as configured in your `config.toml`)

This should be sufficient for normal usage.

