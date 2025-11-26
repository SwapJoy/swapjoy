# Email Sending Flow - How It Works

## Overview

**Supabase handles all email sending** - we just trigger it. The actual email delivery is done by Supabase's backend using the SMTP configuration you set up.

## Two Scenarios

### Scenario 1: During Signup (Automatic)

**What happens:**
1. User calls `signUpWithEmail()` in our code
2. We call `supabase.auth.signUp({ email, password })`
3. **Supabase automatically sends email** (if "Enable email confirmations" is ON in dashboard)
4. Supabase uses your SMTP configuration (Gmail) to send the email
5. Email contains OTP code (if template uses `{{ .Token }}`)

**Who sends it:** Supabase (automatically)
**When:** During signup
**Our code:** Just calls `signUp()`, Supabase handles the rest

### Scenario 2: Resend OTP (Manual Trigger)

**What happens:**
1. User clicks "Resend" on EmailVerificationScreen
2. Our code calls `AuthService.sendEmailOTP(email)`
3. Which calls `supabase.auth.signInWithOtp({ email })`
4. **Supabase sends email** using SMTP configuration
5. Email contains new OTP code

**Who sends it:** Supabase (triggered by our code)
**When:** When user requests resend
**Our code:** Calls `signInWithOtp()` to trigger email send

## Important Points

✅ **Supabase always sends the emails** - we just trigger it
✅ **SMTP configuration** in Supabase Dashboard is what actually sends emails
✅ **Our code** just calls Supabase's auth methods
✅ **Email templates** are configured in Supabase Dashboard

## Code Flow

### Signup Flow:
```
User → EmailSignUpScreen → useEmailSignUp.signUp()
  → AuthService.signUpWithEmail()
    → supabase.auth.signUp()
      → Supabase backend sends email via SMTP ← EMAIL SENT HERE
        → Returns user (no session if confirmations enabled)
```

### Resend Flow:
```
User clicks "Resend" → useEmailVerification.handleResendOTP()
  → AuthService.sendEmailOTP()
    → supabase.auth.signInWithOtp()
      → Supabase backend sends email via SMTP ← EMAIL SENT HERE
```

## Where Email Actually Gets Sent

**Supabase's backend server:**
- Reads your SMTP configuration from dashboard
- Connects to Gmail SMTP (`smtp.gmail.com:587`)
- Sends email using your credentials
- Uses email template from dashboard
- Replaces `{{ .Token }}` with 6-digit code

**Our code:**
- Just triggers Supabase to send
- Doesn't directly connect to SMTP
- Doesn't send emails itself

## Summary

| Action | Who Sends Email | How |
|--------|----------------|-----|
| **Signup** | Supabase (automatic) | `supabase.auth.signUp()` triggers email |
| **Resend OTP** | Supabase (manual trigger) | `supabase.auth.signInWithOtp()` triggers email |
| **Actual SMTP** | Supabase backend | Uses SMTP config from dashboard |

**Bottom line:** Supabase handles all email sending. Our code just tells Supabase when to send emails.

