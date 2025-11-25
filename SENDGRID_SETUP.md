# SendGrid Setup for SwapJoy (Recommended)

## Why SendGrid Instead of Gmail?

✅ **More Secure** - No app passwords needed, uses API keys  
✅ **Better Deliverability** - Emails less likely to go to spam  
✅ **Built for Transactional Emails** - Designed for OTP codes, notifications  
✅ **Free Tier** - 100 emails/day free (perfect for MVP)  
✅ **Better Analytics** - Track email delivery, opens, bounces  
✅ **Professional** - Industry standard for transactional emails  

## Step 1: Create SendGrid Account

1. **Sign Up**
   - Go to: https://signup.sendgrid.com/
   - Choose **Free** plan (100 emails/day)
   - Complete signup and verify your email

2. **Verify Your Email**
   - Check your inbox for verification email
   - Click the verification link

## Step 2: Create API Key

1. **Navigate to API Keys**
   - In SendGrid Dashboard, go to **Settings** → **API Keys**
   - Or click your profile → **API Keys**

2. **Create New API Key**
   - Click **"Create API Key"** button
   - Name: `Supabase SMTP`
   - Permissions: Select **"Full Access"** (or just **"Mail Send"** for security)
   - Click **"Create & View"**

3. **Copy the API Key**
   - ⚠️ **IMPORTANT**: Copy it immediately - you'll only see it once!
   - Save it somewhere secure (password manager, etc.)
   - Format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 3: Configure in Supabase Dashboard

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Select your SwapJoy project

2. **Navigate to SMTP Settings**
   - Go to: **Authentication** → **Settings**
   - Scroll to **SMTP Settings** section

3. **Enter SendGrid SMTP Details**
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [Paste your SendGrid API key here]
   Sender Email: support@swapjoy.me
   Sender Name: SwapJoy
   ```

   **Important Notes:**
   - **SMTP User** is literally the word `apikey` (not your email)
   - **SMTP Password** is your SendGrid API key (the long string starting with `SG.`)

4. **Save Settings**
   - Click **Save** or **Update**
   - Supabase will test the connection

## Step 4: Verify Domain (Optional but Recommended)

For better deliverability, verify your domain:

1. **In SendGrid Dashboard**
   - Go to **Settings** → **Sender Authentication**
   - Click **"Authenticate Your Domain"**

2. **Enter Your Domain**
   - Domain: `swapjoy.me`
   - Follow the DNS setup instructions

3. **Add DNS Records**
   - Add the provided CNAME records to your domain's DNS
   - Wait for verification (can take a few hours)

4. **Benefits**
   - Better email deliverability
   - Emails won't show "via sendgrid.net"
   - Professional appearance

## Step 5: Test Email Sending

1. **In Supabase Dashboard**
   - Look for "Test SMTP" or "Send test email" button
   - Send a test email to verify it works

2. **Test in Your App**
   - Try signing up with email
   - Check inbox for OTP code
   - Should arrive within seconds

## Step 6: Monitor Email Activity

1. **In SendGrid Dashboard**
   - Go to **Activity** → **Email Activity**
   - You can see:
     - Emails sent
     - Delivery status
     - Bounces/errors
     - Opens/clicks (if enabled)

## Troubleshooting

### "Authentication Failed" Error
- Verify API key is correct (starts with `SG.`)
- Make sure SMTP User is exactly `apikey` (lowercase)
- Check API key hasn't been revoked

### "Connection Timeout" Error
- Verify port 587 is not blocked
- Try port 465 with SSL (if available)
- Check firewall settings

### Emails Not Arriving
- Check SendGrid Activity dashboard for delivery status
- Check spam folder
- Verify sender email is correct
- Check SendGrid account isn't suspended

### Rate Limits
- Free tier: 100 emails/day
- If you exceed, upgrade to Essentials plan ($19.95/month for 50,000 emails)

## Cost Comparison

| Service | Free Tier | Production Cost |
|---------|-----------|-----------------|
| **SendGrid** | 100/day | $19.95/month (50k emails) |
| **Mailgun** | 5,000/month | $35/month (50k emails) |
| **AWS SES** | Pay-as-you-go | $0.10 per 1,000 emails |
| **Gmail** | Unlimited* | Free (but not recommended) |

*Gmail has rate limits and deliverability issues

## Security Benefits

✅ **No App Passwords** - Uses secure API keys  
✅ **API Key Rotation** - Easy to rotate keys if compromised  
✅ **Access Control** - Can limit API key permissions  
✅ **Audit Logs** - Track all email activity  
✅ **Industry Standard** - Used by major companies  

## Next Steps

After setup:
1. ✅ Test email signup flow
2. ✅ Verify OTP codes arrive
3. ✅ Monitor SendGrid dashboard for delivery
4. ✅ Consider domain verification for better deliverability
5. ✅ Set up email alerts for bounces/errors

## Migration from Gmail

If you already have Gmail SMTP configured:
1. Set up SendGrid (steps above)
2. Update Supabase SMTP settings
3. Test email sending
4. Remove Gmail app password (for security)

---

**Recommendation**: Use SendGrid for production. It's free, secure, and designed for transactional emails like OTP codes.

