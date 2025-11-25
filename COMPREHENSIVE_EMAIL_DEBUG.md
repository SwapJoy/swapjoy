# Comprehensive Email Debugging Checklist

## Current Issue
- ✅ SMTP configured correctly
- ❌ Getting 504 timeout
- ❌ Not receiving emails

## Step-by-Step Debugging

### Step 1: Test SMTP Connection Directly

**In Supabase Dashboard:**
1. Go to: **Authentication** → **Settings** → **SMTP Settings**
2. Look for **"Test SMTP"** or **"Send test email"** button
3. Click it and send a test email to yourself
4. **Result:**
   - ✅ Test email arrives = SMTP works, issue is with signup flow
   - ❌ Test email doesn't arrive = SMTP configuration issue
   - ❌ Test times out = SMTP connection problem

### Step 2: Check Supabase Auth Logs (Critical!)

**Go to: Logs → Auth Logs**

Look for the most recent signup attempt and check:

1. **SMTP Connection Errors:**
   - "Authentication failed" = wrong password
   - "Connection refused" = port blocked
   - "Connection timeout" = network/firewall issue
   - "535 Authentication failed" = wrong credentials

2. **Email Sending Errors:**
   - "Error sending email" = SMTP issue
   - "Template error" = email template problem
   - "Rate limit exceeded" = too many emails

3. **Exact Error Messages:**
   - Copy the full error message
   - Look for specific SMTP error codes

### Step 3: Verify Gmail Account Status

1. **Check Account is Active:**
   - Log into `support@swapjoy.me` in Gmail
   - Verify you can send emails normally
   - Check if account shows any warnings

2. **Check App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Verify the app password exists and is active
   - Check if it was recently created (might need a few minutes to activate)

3. **Check 2-Step Verification:**
   - Must be enabled
   - Go to: https://myaccount.google.com/security
   - Verify 2-Step Verification is ON

### Step 4: Check Network/Firewall

1. **Port Blocking:**
   - Port 587 or 465 might be blocked
   - Try from different network
   - Check if corporate firewall is blocking

2. **DNS Resolution:**
   - Verify `smtp.gmail.com` resolves correctly
   - Can test with: `nslookup smtp.gmail.com`

### Step 5: Try Alternative Ports

**Option A: Port 465 (SSL)**
```
SMTP Port: 465
```
- Uses SSL instead of TLS
- Sometimes faster/more reliable

**Option B: Port 587 (TLS) - Current**
```
SMTP Port: 587
```
- Standard TLS port
- What you're currently using

### Step 6: Check Email Template

1. **Go to: Authentication → Email Templates**
2. **Check "Confirm your signup" template:**
   - Should use `{{ .Token }}` for OTP
   - No syntax errors
   - Valid HTML

3. **Test with Simple Template:**
   Try this minimal template to rule out template issues:
   ```html
   <p>Your code is: {{ .Token }}</p>
   ```

### Step 7: Check Supabase Project Settings

1. **Email Confirmations:**
   - Go to: **Authentication** → **Settings** → **Email**
   - Verify "Enable email confirmations" is ON (as you want)
   - Check OTP settings:
     - OTP Length: 6
     - OTP Expiry: 3600

2. **Rate Limits:**
   - Go to: **Project Settings** → **Auth** → **Rate Limits**
   - Check "Email sent per hour" limit
   - Make sure it's not too low

### Step 8: Verify SMTP Credentials Format

**Double-check these exact values:**

```
SMTP Host: smtp.gmail.com
SMTP Port: 587 (or 465)
SMTP User: support@swapjoy.me
SMTP Password: [16 characters, NO SPACES]
```

**Common mistakes:**
- ❌ Password has spaces: `xxxx xxxx xxxx xxxx`
- ✅ Password no spaces: `xxxxxxxxxxxxxxxx`
- ❌ Username missing @domain
- ✅ Username is full email

### Step 9: Check Gmail Workspace Restrictions

If using Google Workspace:
1. **Check Admin Settings:**
   - SMTP might be restricted by admin
   - Contact workspace admin if needed

2. **Check Security Settings:**
   - Some Workspace accounts have SMTP restrictions
   - Verify SMTP is allowed for this account

### Step 10: Test with Different Email Address

Try signing up with a different email:
- Rules out email-specific issues
- Tests if problem is with specific email
- Helps identify if it's Gmail account issue

## What to Check in Logs

**In Supabase Dashboard → Logs → Auth Logs:**

Look for these specific patterns:

1. **SMTP Connection:**
   ```
   "smtp connection"
   "smtp authentication"
   "smtp error"
   ```

2. **Email Sending:**
   ```
   "error sending email"
   "email delivery failed"
   "smtp timeout"
   ```

3. **Template Issues:**
   ```
   "template error"
   "template parsing"
   "invalid template"
   ```

## Quick Test Checklist

Run through these in order:

- [ ] Test SMTP with "Test" button in Supabase
- [ ] Check Auth Logs for exact error
- [ ] Verify app password is correct (16 chars, no spaces)
- [ ] Try port 465 instead of 587
- [ ] Check Gmail account can send emails normally
- [ ] Verify 2-Step Verification is enabled
- [ ] Check email template uses `{{ .Token }}`
- [ ] Test with different email address
- [ ] Check rate limits aren't exceeded
- [ ] Verify SMTP User is full email: `support@swapjoy.me`

## Most Likely Causes

Based on timeout + no email:

1. **SMTP Authentication Failing Silently**
   - Wrong app password
   - Password has spaces
   - App password expired/revoked

2. **Network/Firewall Blocking**
   - Port 587 blocked
   - Corporate firewall
   - ISP blocking SMTP

3. **Gmail Account Issues**
   - Account restricted
   - SMTP disabled for account
   - Workspace admin restrictions

4. **Supabase Configuration**
   - SMTP not actually enabled
   - Wrong credentials saved
   - Template error preventing send

## Next Steps

1. **Check Supabase Auth Logs** - This will show the exact error
2. **Test SMTP** - Use test button to verify connection
3. **Share the exact error** from logs so we can fix it

What do you see in the Supabase Auth Logs? That will tell us exactly what's failing.

