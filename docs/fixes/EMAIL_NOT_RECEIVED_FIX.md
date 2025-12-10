# Fix: Email OTP Not Being Received

## Current Status
- Signup completes (user is created)
- Email OTP is not being sent/received

## Debugging Steps

### Step 1: Check Supabase Configuration

**Critical Settings:**

1. **Go to Supabase Dashboard**
   - Authentication → Settings → Email

2. **Verify These Settings:**
   ```
   Enable email confirmations: OFF (important!)
   OTP Length: 6
   OTP Expiry: 3600
   ```

3. **Check SMTP Settings:**
   - Authentication → Settings → SMTP Settings
   - Verify SMTP is enabled
   - Test SMTP connection

### Step 2: Check Supabase Logs

1. **Go to: Logs → Auth Logs**
2. **Look for:**
   - Email sending attempts
   - SMTP errors
   - OTP generation logs
   - Any error messages

3. **Check for these errors:**
   - "Authentication failed" = SMTP password wrong
   - "Connection timeout" = SMTP connection issue
   - "Rate limit exceeded" = Too many emails sent
   - "Email not sent" = SMTP configuration issue

### Step 3: Verify Email Template

1. **Go to: Authentication → Email Templates**
2. **Check "Confirm your signup" template:**
   - Should use `{{ .Token }}` for OTP codes
   - Not `{{ .ConfirmationURL }}` (that's for magic links)

### Step 4: Test SMTP Directly

1. **In Supabase Dashboard:**
   - Look for "Test SMTP" or "Send test email" button
   - Send a test email
   - Check if it arrives

2. **If test email doesn't arrive:**
   - SMTP configuration is wrong
   - Check Gmail app password
   - Verify SMTP credentials

### Step 5: Common Issues

#### Issue 1: Email Confirmations Enabled
**Problem:** If "Enable email confirmations" is ON, Supabase tries to send email during signup, which can fail.

**Fix:**
- Set "Enable email confirmations" to OFF
- We send OTP manually after signup

#### Issue 2: SMTP Not Working
**Problem:** Gmail SMTP credentials are wrong or account is blocked.

**Fix:**
- Verify app password is correct (16 characters, no spaces)
- Check Gmail account is not suspended
- Try creating new app password

#### Issue 3: Email Template Issue
**Problem:** Template has syntax errors or wrong variables.

**Fix:**
- Template should use `{{ .Token }}`
- Check for HTML syntax errors
- Try simple template first

#### Issue 4: Rate Limit
**Problem:** Hit email rate limit.

**Fix:**
- Check rate limit in Settings → Rate Limits
- Wait 1 hour for reset
- Increase rate limit

### Step 6: Test Flow

1. **Try signup again**
2. **Check console logs** for:
   - "[AuthService] User created, sending email OTP..."
   - "[AuthService] Sending email OTP to: [email]"
   - "[AuthService] Email OTP sent successfully"

3. **If you see errors:**
   - Copy the exact error message
   - Check Supabase logs for details

### Step 7: Manual OTP Request

If email doesn't arrive, user can request OTP again:
1. On EmailVerificationScreen
2. Click "Resend" button
3. This calls `sendEmailOTP` again

## Quick Checklist

Before testing again, verify:
- [ ] "Enable email confirmations" is OFF
- [ ] SMTP is enabled and configured
- [ ] SMTP test email works
- [ ] Email template uses `{{ .Token }}`
- [ ] Rate limit is not exceeded
- [ ] Gmail app password is correct
- [ ] Check Supabase Auth Logs for errors

## What to Share for Debugging

If still not working, share:
1. **Supabase Auth Logs** - Last few entries
2. **Console logs** - From your app when signing up
3. **SMTP test result** - Did test email work?
4. **Email template** - Current template content

## Alternative: Test with Different Email

Try signing up with a different email address:
- Rule out email-specific issues
- Check if emails go to spam
- Verify email address is correct

## Next Steps

1. ✅ Check Supabase configuration (settings above)
2. ✅ Check Supabase Auth Logs for errors
3. ✅ Test SMTP with test email button
4. ✅ Try signup again and check logs
5. ✅ If email still doesn't arrive, check spam folder


