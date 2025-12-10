# Troubleshooting "Error sending confirmation email"

## The Problem
Getting `500 Error: "Error sending confirmation email"` during signup. This means Supabase can't send the email.

## Common Causes

### 1. SMTP Configuration Issues (Most Likely)

**Check in Supabase Dashboard:**
- Go to: **Authentication** → **Settings** → **SMTP Settings**
- Verify SMTP is **enabled**
- Check all credentials are correct:
  - Host: `smtp.gmail.com`
  - Port: `587`
  - User: `support@swapjoy.me`
  - Password: (your app-specific password)

**Common SMTP Issues:**
- ❌ Wrong app-specific password
- ❌ Port 587 blocked by firewall
- ❌ SMTP not enabled in Supabase
- ❌ Gmail account not verified

### 2. Email Template Syntax Error

The template might have invalid syntax. Check:
- Go to: **Authentication** → **Email Templates**
- Make sure template uses valid variables:
  - For confirmation: `{{ .ConfirmationURL }}` (magic link)
  - For OTP: `{{ .Token }}` (6-digit code)
- No HTML syntax errors

### 3. Supabase Trying to Send Email Automatically

When `supabase.auth.signUp()` is called, Supabase automatically tries to send a confirmation email if:
- User needs email confirmation
- Email sending is enabled

## Solutions

### Solution 1: Disable Automatic Email Sending During Signup

Update the signup to prevent automatic email sending, then send OTP manually:

```typescript
// In signUpWithEmail, prevent automatic email
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: userData,
    emailRedirectTo: undefined, // No redirect
    // Prevent automatic email sending
  },
});
```

### Solution 2: Fix SMTP Configuration

1. **Verify Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Create new app password if needed
   - Copy the 16-character password exactly (no spaces)

2. **Test SMTP in Supabase:**
   - Go to: **Authentication** → **Settings** → **SMTP Settings**
   - There should be a "Test" button
   - Click it to verify SMTP works

3. **Check Gmail Account:**
   - Make sure 2-Step Verification is enabled
   - Make sure account is active and not locked

### Solution 3: Temporarily Disable Email Confirmation

For testing, you can disable email confirmation:
- Go to: **Authentication** → **Settings** → **Email**
- Set **"Enable email confirmations"** to **OFF**
- This allows signup without sending emails

Then manually send OTP after signup completes.

### Solution 4: Check Supabase Logs

1. **Go to Supabase Dashboard**
2. **Click "Logs"** in left sidebar
3. **Select "Auth Logs"**
4. Look for detailed error messages about email sending
5. Check for SMTP connection errors

## Quick Fix: Update Signup Flow

The issue might be that Supabase is trying to send confirmation email during signup. We can modify the flow to:
1. Sign up without automatic email
2. Manually send OTP after signup

Let me update the code to handle this better.


