# Fix Signup Timeout Issue

## The Problem
Signup is timing out after 30 seconds because Supabase is trying to send an email during signup, and Gmail SMTP is slow to respond.

## Solutions Applied

### 1. Increased Timeout for Auth Operations ✅
- Updated `lib/supabase.ts` to use 60-second timeout for auth operations (signup, signin, OTP)
- This gives more time for email sending

### 2. Made OTP Sending Non-Blocking ✅
- OTP email is now sent in the background (doesn't block signup response)
- Signup completes immediately, email sends separately
- If email fails, user can request OTP again from verification screen

### 3. Disable Email Confirmations in Supabase (Important!)

**You need to do this in Supabase Dashboard:**

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/
   - Select your SwapJoy project

2. **Navigate to Email Settings**
   - Go to: **Authentication** → **Settings** → **Email**
   - Or: **Project Settings** → **Auth** → **Email**

3. **Disable Email Confirmations**
   - Find **"Enable email confirmations"**
   - Set it to **OFF**
   - This prevents Supabase from automatically sending emails during signup

4. **Save Settings**

## Why This Fixes the Timeout

**Before:**
- Signup → Supabase tries to send email → Waits for Gmail SMTP → Times out after 30s

**After:**
- Signup → Completes immediately → Email sends in background → No timeout
- If email fails, user can request OTP again

## Additional Configuration

### Check Supabase Email Settings

Make sure these settings are correct:

```
Enable email confirmations: OFF
OTP Length: 6
OTP Expiry: 3600 (1 hour)
```

### Verify SMTP is Working

Even though we're not blocking on email, SMTP should still work:
- Check Supabase Dashboard → Authentication → Settings → SMTP Settings
- Verify Gmail SMTP is configured correctly
- Test SMTP connection if available

## Testing

After making these changes:

1. ✅ Signup should complete quickly (no timeout)
2. ✅ User should be created
3. ✅ OTP email should arrive (may take a few seconds)
4. ✅ If email doesn't arrive, user can request OTP again

## If Timeout Still Occurs

1. **Check Supabase Dashboard**
   - Verify "Enable email confirmations" is OFF
   - Check SMTP settings are correct

2. **Check Network**
   - Slow network can cause timeouts
   - Try on different network

3. **Check Gmail SMTP**
   - Gmail SMTP might be slow
   - Consider using SendGrid for better performance (see SENDGRID_SETUP.md)

## Summary

✅ **Code changes applied:**
- Increased timeout to 60s for auth operations
- Made OTP sending non-blocking

✅ **Action required:**
- Disable "Enable email confirmations" in Supabase Dashboard
- This prevents automatic email sending during signup

After these changes, signup should work without timeouts!

