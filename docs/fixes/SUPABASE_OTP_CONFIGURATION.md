# Configure Supabase to Send OTP Codes Instead of Magic Links

## Problem
Supabase is sending "magic link" emails instead of OTP codes. You need to configure it to send OTP codes.

## Solution: Configure in Supabase Dashboard

### Step 1: Navigate to Authentication Settings

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/
   - Select your SwapJoy project

2. **Open Authentication Settings**
   - Click **Authentication** in the left sidebar
   - Click **Settings** (or go to **Project Settings** → **Auth**)

### Step 2: Configure Email Provider Settings

1. **Find "Email" Section**
   - Scroll down to the **Email** configuration section

2. **Enable OTP for Email**
   - Look for **"Enable email confirmations"** - this should be **OFF** for OTP flow
   - Find **"Email OTP"** or **"OTP Length"** setting
   - Ensure OTP is enabled (not magic links)

3. **Key Settings to Check:**
   ```
   Enable email confirmations: OFF (for OTP flow)
   OTP Length: 6
   OTP Expiry: 3600 (1 hour)
   ```

### Step 3: Configure Email Templates (CRITICAL!)

Supabase uses email templates. You MUST update the template to send OTP codes instead of magic links.

1. **Go to Email Templates**
   - In Supabase Dashboard: **Authentication** → **Email Templates**
   - Or: **Project Settings** → **Auth** → **Email Templates**

2. **Find the "Confirmation" Template**
   - Look for template named: **"Confirm your signup"** or **"Confirmation"**
   - This is the template you're currently seeing

3. **Replace the Template Content**

   **Current (Magic Link - WRONG):**
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your user:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
   ```

   **Replace with (OTP - CORRECT):**
   ```html
   <h2>Confirm your signup</h2>
   <p>Your verification code is:</p>
   <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; margin: 20px 0;">{{ .Token }}</h1>
   <p>Enter this 6-digit code in the app to verify your email.</p>
   <p><small>This code will expire in 1 hour.</small></p>
   ```

   **Alternative (Simple Text Version):**
   ```
   Confirm your signup
   
   Your verification code is: {{ .Token }}
   
   Enter this 6-digit code in the app to verify your email.
   
   This code will expire in 1 hour.
   ```

4. **Update Subject Line**
   - Change subject from: `Confirm your signup`
   - To: `Your SwapJoy verification code`
   - Or: `Your verification code: {{ .Token }}`

5. **Save the Template**
   - Click **Save** or **Update**
   - The template is now configured for OTP codes

### Step 4: Alternative - Use API Configuration

If the dashboard doesn't have clear OTP settings, you can configure it via the API or by using the correct method:

**The issue:** When you call `signInWithOtp({ email })`, Supabase checks:
- If `emailRedirectTo` is provided → sends magic link
- If `emailRedirectTo` is NOT provided → should send OTP

**Our code already sets `emailRedirectTo: undefined`**, so it should send OTP. The issue might be:
1. Supabase project configuration defaults to magic links
2. Email template is configured for magic links

### Step 5: Verify Configuration

1. **Check Current Configuration**
   - In Supabase Dashboard → Authentication → Settings
   - Look for any "Magic Link" or "OTP" toggle switches
   - Ensure OTP is selected/enabled

2. **Test the Flow**
   - Try signing up again
   - Check the email - it should contain a 6-digit code, not a link

## Alternative: Use Supabase API Directly

If dashboard configuration doesn't work, you can try using the Admin API or configuring via `config.toml`:

### In config.toml (Local Development)

```toml
[auth.email]
enable_signup = true
enable_confirmations = false  # Important: OFF for OTP
otp_length = 6
otp_expiry = 3600

# Disable magic links
[auth.email.template.magiclink]
enabled = false  # If this option exists
```

## Troubleshooting

### Still Getting Magic Links?

1. **Check Email Template**
   - Go to Authentication → Email Templates
   - Ensure the template uses `{{ .Token }}` not `{{ .ConfirmationURL }}`

2. **Check API Call**
   - Verify `emailRedirectTo` is NOT set in the code
   - Our code already sets it to `undefined`

3. **Contact Supabase Support**
   - If OTP option is not visible in dashboard
   - They may need to enable it for your project

### Error: "Error sending magic link email"

This error suggests Supabase is still trying to send magic links. Solutions:

1. **Explicitly disable magic links in API call:**
   ```typescript
   await supabase.auth.signInWithOtp({
     email: email.trim().toLowerCase(),
     options: {
       shouldCreateUser: false,
       // Explicitly don't use redirect
       emailRedirectTo: undefined,
     },
   });
   ```

2. **Use a different endpoint** (if available):
   - Some Supabase versions have `signInWithPassword` + separate OTP send
   - Check Supabase docs for your version

## Quick Fix: Update Code to Force OTP

I've already updated the code to set `emailRedirectTo: undefined`. Now you need to:

1. **Configure Supabase Dashboard** (steps above)
2. **Test again** - should now send OTP codes

## Next Steps

1. Configure Supabase Dashboard as described above
2. Test email signup flow
3. Verify you receive a 6-digit code (not a magic link)
4. If still getting magic links, check Supabase documentation for your specific version

