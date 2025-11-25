# SMTP Setup Guide for SwapJoy

## Overview
This guide will help you configure SMTP settings in Supabase to send email OTP codes from `support@swapjoy.me`.

## ⚠️ Important: Use SendGrid Instead of Gmail

**Gmail/Google Workspace SMTP has security and deliverability issues:**
- ❌ Requires app passwords (less secure)
- ❌ Designed for personal email, not transactional emails
- ❌ Lower deliverability rates (emails may go to spam)
- ❌ Rate limits (can only send ~500 emails/day)
- ❌ May get blocked by email providers
- ❌ Google warns that app passwords are less secure

**✅ RECOMMENDED: Use SendGrid (Free & Secure)**
- ✅ No app passwords needed - uses secure API keys
- ✅ Built for transactional emails (OTP codes, notifications)
- ✅ Better deliverability (emails less likely to go to spam)
- ✅ Free tier: 100 emails/day (perfect for MVP)
- ✅ Industry standard - used by major companies
- ✅ Better analytics and monitoring

**👉 See [SENDGRID_SETUP.md](./SENDGRID_SETUP.md) for complete setup instructions.**

**Quick Setup:**
1. Sign up at https://signup.sendgrid.com/ (Free)
2. Create API key in SendGrid dashboard
3. Configure in Supabase: `smtp.sendgrid.net`, port `587`, user `apikey`, password = API key
4. Done! Much more secure and reliable than Gmail.

## Option 1: Gmail/Google Workspace (Development/Testing Only)

⚠️ **Use this only for development/testing. For production, use Option 2 (SendGrid) or another transactional email service.**

### Step 1: Generate Google Workspace App-Specific Password

Since you're using Google Workspace (`support@swapjoy.me`), you need to create an app-specific password:

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Sign in with your `support@swapjoy.me` account

2. **Navigate to Security**
   - Click on **Security** in the left sidebar
   - Scroll down to **2-Step Verification** section

3. **Enable 2-Step Verification** (if not already enabled)
   - This is required to generate app-specific passwords
   - Follow the setup wizard if needed

4. **Create App-Specific Password**
   - In the Security section, find **App passwords** (or search for it)
   - Click **App passwords**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: `Supabase SMTP`
   - Click **Generate**
   - **Copy the 16-character password** (you'll need this for Supabase)

### Step 2: Configure SMTP in Supabase Dashboard (Gmail)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Sign in and select your SwapJoy project

2. **Navigate to Authentication Settings**
   - In the left sidebar, click **Authentication**
   - Click **Settings** (or go to **Project Settings** → **Auth**)

3. **Find SMTP Settings**
   - Scroll down to **SMTP Settings** section
   - Or look for **Email** → **SMTP Configuration**

4. **Enable and Configure SMTP**
   - Toggle **Enable SMTP** to ON
   - Fill in the following details:

   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: support@swapjoy.me
   SMTP Password: [Paste the 16-character app-specific password from Step 1]
   Sender Email: support@swapjoy.me
   Sender Name: SwapJoy
   ```

5. **Save Settings**
   - Click **Save** or **Update**
   - Supabase will test the connection

### Step 3: Verify Configuration (Gmail)

---

## Option 2: SendGrid Setup (Recommended for Production)

SendGrid is a transactional email service with excellent deliverability and a generous free tier (100 emails/day).

### Step 1: Create SendGrid Account

1. **Sign up for SendGrid**
   - Go to: https://signup.sendgrid.com/
   - Choose **Free** plan (100 emails/day)
   - Complete signup and verify your email

2. **Verify Your Domain** (Optional but Recommended)
   - Go to **Settings** → **Sender Authentication**
   - Click **Authenticate Your Domain**
   - Follow the DNS setup instructions for `swapjoy.me`
   - This improves deliverability significantly

3. **Create API Key**
   - Go to **Settings** → **API Keys**
   - Click **Create API Key**
   - Name: `Supabase SMTP`
   - Permissions: **Full Access** (or **Mail Send** only)
   - Click **Create & View**
   - **Copy the API key** (you'll only see it once!)

### Step 2: Configure SendGrid SMTP in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Select your SwapJoy project
   - Navigate: **Authentication** → **Settings** → **SMTP Settings**

2. **Enter SendGrid SMTP Details**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [Paste your SendGrid API key here]
   Sender Email: support@swapjoy.me
   Sender Name: SwapJoy
   ```

3. **Save Settings**
   - Click **Save**
   - Supabase will test the connection

### Step 3: Verify SendGrid Configuration

1. **Test Email Sending**
   - Attempt a signup in your app
   - Check email inbox for OTP code
   - Should arrive within seconds

2. **Check SendGrid Dashboard**
   - Go to **Activity** → **Email Activity**
   - You should see the email being sent
   - Green checkmark = delivered successfully

---

## Option 3: Mailgun Setup (Alternative)

Mailgun offers 5,000 free emails/month.

### Step 1: Create Mailgun Account

1. **Sign up**: https://signup.mailgun.com/new/signup
2. **Verify domain**: Add DNS records for `swapjoy.me`
3. **Get SMTP credentials**: Settings → Sending → SMTP credentials

### Step 2: Configure in Supabase

```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Your Mailgun SMTP username]
SMTP Password: [Your Mailgun SMTP password]
Sender Email: support@swapjoy.me
Sender Name: SwapJoy
```

---

## Option 4: AWS SES Setup (Most Cost-Effective)

AWS SES is very cheap ($0.10 per 1,000 emails) but requires AWS account setup.

### Step 1: Set Up AWS SES

1. **Create AWS Account** (if you don't have one)
2. **Go to AWS SES Console**
3. **Verify Email Address**: support@swapjoy.me
4. **Request Production Access** (move out of sandbox)
5. **Create SMTP Credentials**: SMTP Settings → Create SMTP Credentials

### Step 2: Configure in Supabase

```
SMTP Host: email-smtp.[region].amazonaws.com (e.g., email-smtp.us-east-1.amazonaws.com)
SMTP Port: 587
SMTP User: [Your AWS SES SMTP username]
SMTP Password: [Your AWS SES SMTP password]
Sender Email: support@swapjoy.me
Sender Name: SwapJoy
```

---

## Step 3: Verify Configuration (All Options)

1. **Test Email Sending**
   - You can test by attempting a signup in your app
   - Check the email inbox for `support@swapjoy.me`
   - The OTP code should arrive within a few seconds

2. **Check Supabase Logs** (if email doesn't arrive)
   - Go to **Logs** → **Auth Logs** in Supabase Dashboard
   - Look for any SMTP-related errors

## Alternative: Using Supabase CLI (Local Development)

If you're running Supabase locally, you can also configure SMTP in `config.toml`:

```toml
[auth.email.smtp]
enabled = true
host = "smtp.gmail.com"
port = 587
user = "support@swapjoy.me"
pass = "env(GMAIL_APP_PASSWORD)"
admin_email = "support@swapjoy.me"
sender_name = "SwapJoy"
```

Then set the environment variable:
```bash
export GMAIL_APP_PASSWORD="your-16-character-app-password"
```

## Recommendation Summary

| Service | Free Tier | Best For | Setup Difficulty |
|---------|-----------|----------|------------------|
| **SendGrid** | 100/day | Production (Recommended) | Easy ⭐ |
| **Mailgun** | 5,000/month | Production | Easy ⭐ |
| **AWS SES** | Pay-as-you-go | High volume | Medium ⭐⭐ |
| **Gmail** | Unlimited* | Development only | Easy ⭐ |

*Gmail has rate limits and deliverability issues for transactional emails.

**For SwapJoy, I recommend SendGrid** - it's free, easy to set up, and has excellent deliverability.

---

## Troubleshooting

### Email Not Sending (Gmail)
- Verify 2-Step Verification is enabled on Google account
- Check that app-specific password is correct (no spaces)
- Ensure SMTP port 587 is not blocked by firewall
- Check Supabase logs for SMTP errors

### Email Not Sending (SendGrid/Mailgun)
- Verify API key/credentials are correct
- Check SendGrid/Mailgun dashboard for delivery status
- Ensure sender email is verified
- Check Supabase logs for SMTP errors
- Verify domain authentication (if using custom domain)

### "Less Secure App" Error
- Google Workspace doesn't use "Less Secure Apps" anymore
- You MUST use app-specific passwords (not your regular password)
- Make sure 2-Step Verification is enabled

### Port Issues
- Try port **465** with SSL instead of 587 with TLS
- Update config: `port = 465` and ensure SSL is enabled

## Security Notes

- **Never commit** the app-specific password to git
- Store it securely (use environment variables)
- Rotate the password periodically
- The app-specific password is only for SMTP, not for account access

## Next Steps

After configuring SMTP:
1. Test email signup flow in your app
2. Verify OTP codes are received
3. Check email deliverability (spam folder if needed)
4. Consider setting up SPF/DKIM records for better deliverability (optional)

