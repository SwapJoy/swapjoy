# Email Debugging Checklist

## Current Status
- ✅ SMTP configured: `smtp.gmail.com:587`
- ✅ Username: `support@swapjoy.me`
- ✅ Password: App password set
- ❌ Getting 504 timeout
- ❌ Not receiving emails

## Critical Checks (Do These First)

### 1. Test SMTP Connection
**In Supabase Dashboard:**
- Go to: **Authentication** → **Settings** → **SMTP Settings**
- Look for **"Test SMTP"** or **"Send test email"** button
- Click it and send test email
- **Result tells us:**
  - ✅ Test works = SMTP is fine, issue is with signup flow
  - ❌ Test fails = SMTP configuration problem

### 2. Check Supabase Auth Logs (MOST IMPORTANT)
**Go to: Logs → Auth Logs**

Look for your signup attempt and check for:
- Exact SMTP error message
- Connection errors
- Authentication failures
- Timeout details

**Copy the exact error message** - this will tell us what's wrong.

### 3. Verify App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Check if app password exists and is active
3. **Create a fresh one** if unsure:
   - Delete old one
   - Create new: Mail → Other → "Supabase SMTP"
   - Copy the 16-character password (no spaces!)
4. Update in Supabase SMTP settings

### 4. Try Port 465 Instead of 587
**In Supabase SMTP Settings:**
- Change: `SMTP Port: 587` → `465`
- Port 465 uses SSL and is sometimes faster/more reliable
- Save and test again

### 5. Check Gmail Account
1. Log into `support@swapjoy.me` in Gmail
2. Verify you can send emails normally
3. Check for any account warnings or restrictions
4. Verify 2-Step Verification is enabled

## What the Logs Will Tell Us

**In Supabase Auth Logs, look for:**

1. **"Authentication failed"** or **"535"**
   - Wrong app password
   - Password has spaces
   - Fix: Create fresh app password, verify no spaces

2. **"Connection timeout"** or **"Connection refused"**
   - Port blocked by firewall
   - Network issue
   - Fix: Try port 465, check firewall

3. **"upstream request timeout"** (what you're seeing)
   - Gmail SMTP is too slow
   - Supabase backend times out waiting
   - Fix: Use faster SMTP or increase timeout (if possible)

4. **"Rate limit exceeded"**
   - Too many emails sent
   - Fix: Wait 1 hour or increase rate limit

## Quick Actions

1. **Test SMTP** - Use test button in Supabase
2. **Check Auth Logs** - Get exact error message
3. **Try Port 465** - Sometimes faster
4. **Create Fresh App Password** - Rule out password issues
5. **Check Email Template** - Make sure it's valid

## Most Likely Issue

Given you're getting "upstream request timeout":
- Gmail SMTP is taking >30 seconds to respond
- Supabase backend times out waiting
- This is a known issue with Gmail SMTP being slow

**Possible solutions:**
1. Use port 465 (SSL) - might be faster
2. Verify SMTP actually works (test button)
3. Check if there's a network/firewall issue
4. Consider that Gmail SMTP might just be too slow for this use case

## What to Share

Please share:
1. **Result of SMTP test** - Did test email work?
2. **Exact error from Auth Logs** - Copy the full error message
3. **Whether you tried port 465** - Did it help?

This will help us pinpoint the exact issue!

