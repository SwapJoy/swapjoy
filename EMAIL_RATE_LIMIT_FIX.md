# Fix "Email Rate Limit Exceeded" Error

## The Problem
Getting `429 Error: "email rate limit exceeded"` when trying to sign up. This means you've hit Supabase's email sending rate limit.

## Solution 1: Increase Rate Limit in Supabase Dashboard (Production)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/
   - Select your SwapJoy project

2. **Navigate to Rate Limits**
   - Go to: **Project Settings** → **Auth** → **Rate Limits**
   - Or: **Authentication** → **Settings** → **Rate Limits**

3. **Increase Email Rate Limit**
   - Find **"Email sent per hour"** setting
   - Current limit might be very low (like 2-10 per hour)
   - Increase to a reasonable value:
     - **For testing**: 50-100 per hour
     - **For production**: Based on your needs (100-1000+)

4. **Save Settings**
   - Click **Save** or **Update**
   - Changes take effect immediately

## Solution 2: Wait for Rate Limit to Reset

If you can't change the limit immediately:
- Rate limits typically reset after **1 hour**
- Wait 1 hour and try again
- The limit is per hour, so it will reset automatically

## Solution 3: Update Local Config (If Using Local Supabase)

If you're running Supabase locally, update `config.toml`:

1. **Open config.toml**
   - File: `mobile/SwapJoy/supabase/config.toml`

2. **Find Rate Limit Section**
   ```toml
   [auth.rate_limit]
   email_sent = 2  # This is too low!
   ```

3. **Increase the Limit**
   ```toml
   [auth.rate_limit]
   email_sent = 100  # Much better for testing
   ```

4. **Restart Supabase**
   - If running locally, restart Supabase
   - Changes take effect after restart

## Current Rate Limit in Your Config

Your `config.toml` shows:
```toml
email_sent = 2
```

This means only **2 emails per hour** - very low for testing! This is likely the issue.

## Recommended Rate Limits

| Environment | Recommended Limit |
|-------------|-------------------|
| **Local Development** | 100-500 per hour |
| **Testing/Staging** | 50-100 per hour |
| **Production** | Based on expected traffic |

## Quick Fix Steps

1. **Check Current Limit**
   - Supabase Dashboard → Settings → Rate Limits
   - Note the current "Email sent per hour" value

2. **Increase Limit**
   - Set to at least **50** for testing
   - Or **100+** if you're doing heavy testing

3. **Save and Test**
   - Save settings
   - Wait a minute for changes to propagate
   - Try signup again

## Alternative: Disable Rate Limiting (Development Only)

For local development, you can temporarily disable rate limiting:

**In config.toml:**
```toml
[auth.rate_limit]
email_sent = 1000  # Very high limit
```

**⚠️ Warning:** Don't disable rate limiting in production - it protects against abuse.

## Why This Happened

You've been testing the signup flow multiple times, and each attempt sends an email. With a limit of 2 emails/hour, you quickly hit the limit.

## Prevention

1. **Increase rate limit** to a reasonable value for your use case
2. **Use test mode** if available (some services have test modes that don't count)
3. **Monitor rate limit usage** in Supabase dashboard

## Check Rate Limit Status

1. **Supabase Dashboard**
   - Go to **Logs** → **Auth Logs**
   - Look for rate limit warnings
   - Check how many emails were sent recently

2. **Wait Time**
   - Rate limits reset every hour
   - You can wait 1 hour and try again
   - Or increase the limit now

## Next Steps

1. ✅ Increase email rate limit in Supabase Dashboard (recommended)
2. ✅ Or wait 1 hour for limit to reset
3. ✅ Then test signup again

The SMTP configuration is working fine - you just hit the rate limit from testing!

