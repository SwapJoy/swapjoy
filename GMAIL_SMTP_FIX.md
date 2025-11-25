# Fix Gmail SMTP "Error sending confirmation email"

## The Problem
Getting `500 Error: "Error sending confirmation email"` when signing up. This means Supabase can't connect to Gmail SMTP.

## Step-by-Step Fix

### Step 1: Verify Gmail App Password

1. **Go to Google Account**
   - Visit: https://myaccount.google.com/security
   - Sign in with `support@swapjoy.me`

2. **Check 2-Step Verification**
   - Must be **enabled** to create app passwords
   - If not enabled, enable it first

3. **Create/Verify App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Security → 2-Step Verification → App passwords
   - If you already have one for "Supabase SMTP", you can use it
   - If not, create new:
     - Select app: **Mail**
     - Select device: **Other (Custom name)**
     - Name: `Supabase SMTP`
     - Click **Generate**
   - **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)
   - Remove all spaces when using it (should be 16 characters total)

### Step 2: Configure Supabase SMTP Settings

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Select your SwapJoy project

2. **Navigate to SMTP Settings**
   - Go to: **Authentication** → **Settings**
   - Scroll down to **SMTP Settings** section
   - Or: **Project Settings** → **Auth** → **SMTP Settings**

3. **Enter Gmail SMTP Configuration**
   ```
   Enable SMTP: ON
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: support@swapjoy.me
   SMTP Password: [Paste your 16-character app password - NO SPACES]
   Sender Email: support@swapjoy.me
   Sender Name: SwapJoy
   ```

   **Critical Points:**
   - ✅ Password must be the 16-character app password (no spaces)
   - ✅ NOT your regular Gmail password
   - ✅ Port must be 587 (or try 465 if 587 doesn't work)
   - ✅ User is your full email: `support@swapjoy.me`

4. **Save Settings**
   - Click **Save** or **Update**
   - Supabase will test the connection

### Step 3: Test SMTP Connection

1. **Check for Test Button**
   - In Supabase SMTP settings, look for "Test SMTP" or "Send test email"
   - If available, click it to verify connection

2. **Check Supabase Logs**
   - Go to: **Logs** → **Auth Logs**
   - Look for SMTP connection errors
   - Common errors:
     - "Authentication failed" = wrong password
     - "Connection timeout" = port/firewall issue
     - "Invalid credentials" = wrong username/password

### Step 4: Common Issues & Fixes

#### Issue 1: "Authentication Failed"
**Cause:** Wrong app password or username

**Fix:**
- Double-check app password (16 characters, no spaces)
- Verify username is exactly `support@swapjoy.me`
- Try creating a new app password

#### Issue 2: "Connection Timeout"
**Cause:** Port 587 blocked or firewall issue

**Fix:**
- Try port **465** instead (SSL)
- Update Supabase settings:
  ```
  SMTP Port: 465
  ```
- Some networks block port 587

#### Issue 3: "Invalid Credentials"
**Cause:** App password not created or expired

**Fix:**
- Create a fresh app password
- Make sure 2-Step Verification is enabled
- Wait a few minutes after creating password before using it

#### Issue 4: "Error sending confirmation email" (Current Error)
**Possible Causes:**
1. SMTP not enabled in Supabase
2. Wrong credentials
3. Email template has syntax error
4. Gmail account restrictions

**Fix:**
1. Verify SMTP is enabled (toggle ON)
2. Re-enter app password (copy-paste to avoid typos)
3. Check email template for errors (see Step 5)
4. Try port 465 if 587 doesn't work

### Step 5: Check Email Template

The email template might have syntax errors:

1. **Go to Email Templates**
   - **Authentication** → **Email Templates**
   - Find **"Confirm your signup"** template

2. **Verify Template Syntax**
   - Make sure it uses valid variables:
     - For OTP: `{{ .Token }}`
     - For magic link: `{{ .ConfirmationURL }}`
   - No broken HTML tags
   - No invalid template syntax

3. **Simple Test Template**
   If current template has issues, try this simple one:
   ```html
   <h2>Verify Your Email</h2>
   <p>Your verification code is: {{ .Token }}</p>
   <p>Enter this code in the app.</p>
   ```

### Step 6: Verify Gmail Account Status

1. **Check Account Status**
   - Make sure `support@swapjoy.me` account is active
   - Not suspended or locked
   - Can send emails normally

2. **Check Google Workspace Settings**
   - If using Google Workspace, verify SMTP is allowed
   - Some Workspace accounts restrict SMTP access
   - Contact admin if needed

### Step 7: Alternative Port Configuration

If port 587 doesn't work, try port 465:

1. **Update Supabase Settings**
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 465
   SMTP User: support@swapjoy.me
   SMTP Password: [your app password]
   ```

2. **Note:** Port 465 uses SSL, which might work better on some networks

### Step 8: Debug Steps

1. **Check Supabase Logs**
   - **Logs** → **Auth Logs**
   - Look for detailed error messages
   - Copy the exact error message

2. **Verify App Password Format**
   - Should be exactly 16 characters
   - No spaces when pasting into Supabase
   - Format: `xxxxxxxxxxxxxxxx` (not `xxxx xxxx xxxx xxxx`)

3. **Test with Different Email**
   - Try sending to a different email address
   - Rule out email-specific issues

## Quick Checklist

Before testing again, verify:
- [ ] 2-Step Verification is enabled on Gmail account
- [ ] App password is created (16 characters)
- [ ] App password copied correctly (no spaces)
- [ ] SMTP enabled in Supabase Dashboard
- [ ] SMTP Host: `smtp.gmail.com`
- [ ] SMTP Port: `587` (or `465`)
- [ ] SMTP User: `support@swapjoy.me`
- [ ] SMTP Password: (app password, no spaces)
- [ ] Sender Email: `support@swapjoy.me`
- [ ] Email template has valid syntax

## Still Not Working?

If you've tried everything above:

1. **Check Supabase Logs** for the exact error message
2. **Create a fresh app password** (delete old one, create new)
3. **Try port 465** instead of 587
4. **Verify Gmail account** can send emails normally
5. **Check if Google Workspace** has SMTP restrictions

Share the exact error message from Supabase logs, and I can help debug further!

