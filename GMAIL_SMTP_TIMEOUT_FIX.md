# Fix Gmail SMTP 504 Timeout with Email Confirmations Enabled

## The Problem
Getting `504 upstream request timeout` because:
- Email confirmations are enabled (as you want)
- Supabase tries to send email during signup
- Gmail SMTP is too slow (>30 seconds)
- Supabase backend times out waiting for Gmail

## Solution: Optimize Gmail SMTP Configuration

### Option 1: Use Port 465 with SSL (Recommended)

Port 465 with SSL is often faster and more reliable than port 587 with TLS.

**In Supabase Dashboard:**
1. Go to: **Authentication** → **Settings** → **SMTP Settings**
2. Update configuration:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 465
   SMTP User: support@swapjoy.me
   SMTP Password: [your app password]
   Sender Email: support@swapjoy.me
   Sender Name: SwapJoy
   ```
3. **Important:** Port 465 uses SSL, which might be faster
4. Save and test

### Option 2: Verify SMTP Credentials

The timeout might be because SMTP authentication is failing repeatedly:

1. **Double-check App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Verify the app password is correct
   - Create a fresh one if needed
   - Make sure it's exactly 16 characters (no spaces when pasting)

2. **Verify 2-Step Verification**
   - Must be enabled to use app passwords
   - Check: https://myaccount.google.com/security

3. **Test SMTP Connection**
   - In Supabase Dashboard, look for "Test SMTP" button
   - If test also times out, SMTP configuration is wrong

### Option 3: Check Gmail Account Status

1. **Verify Account is Active**
   - Make sure `support@swapjoy.me` account is not suspended
   - Check if account can send emails normally
   - Verify account is not locked

2. **Check Google Workspace Settings**
   - If using Google Workspace, verify SMTP is allowed
   - Some Workspace accounts restrict SMTP access
   - Contact admin if needed

### Option 4: Network/Firewall Issues

The timeout might be due to network issues:

1. **Check Firewall**
   - Port 587 or 465 might be blocked
   - Try from different network
   - Check if corporate firewall is blocking

2. **Check DNS**
   - Verify `smtp.gmail.com` resolves correctly
   - Try using IP address (not recommended but can test)

## Why Gmail SMTP is Slow

Gmail SMTP can be slow because:
- It's designed for personal email, not high-volume transactional
- Rate limiting and throttling
- Network latency
- Authentication overhead

## Alternative: Hybrid Approach

If Gmail continues to timeout, you could:

1. **Keep email confirmations enabled** (as you want)
2. **But use a faster SMTP** for sending (SendGrid, Mailgun)
3. **Still send from support@swapjoy.me** (if you verify domain)

This gives you:
- ✅ Email confirmations enabled
- ✅ Fast, reliable email delivery
- ✅ Professional email address

## Immediate Actions

1. **Try Port 465** (often faster than 587)
2. **Verify app password** is correct
3. **Test SMTP** in Supabase Dashboard
4. **Check Supabase Auth Logs** for detailed error

## Check Supabase Logs

Go to: **Logs** → **Auth Logs**

Look for:
- SMTP connection errors
- Authentication failures
- Timeout details
- Exact error messages

Share the exact error from logs, and I can help debug further!

