# Supabase Setup for SwapJoy Mobile App

## 🔧 **Configuration Steps:**

### **1. Get Your Supabase Credentials:**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### **2. Update Configuration:**

Edit `config/supabase.ts` and replace the placeholder values:

```typescript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### **3. Configure Supabase Authentication:**

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. **Enable Phone provider:**
   - Turn on "Phone" provider
   - Configure SMS settings (Twilio, MessageBird, etc.)
   - Set confirmation URL: `swapjoy://auth/confirm`

3. **Disable other providers for MVP:**
   - Turn off Email, Google, Apple, Facebook

### **4. Set Up Database:**

Run the SQL from `docs/data-models/database-schema.md` in your Supabase SQL editor:

1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste the SQL from the database schema file
3. Run the SQL to create all tables

### **5. Test the App:**

1. Run the app: `npm run ios`
2. Try signing up with a phone number
3. Check your Supabase dashboard to see the new user

## 🚀 **Next Steps:**

- [ ] Add phone number validation
- [ ] Implement OTP verification
- [ ] Add location services
- [ ] Create item listing screens
- [ ] Add image upload functionality

## 📱 **Features Implemented:**

- ✅ Phone number authentication
- ✅ User registration and login
- ✅ Session management
- ✅ Auth state persistence
- ✅ Basic UI for authentication

## 🔍 **Troubleshooting:**

- **SMS not working:** Check your SMS provider configuration in Supabase
- **Database errors:** Ensure all tables are created correctly
- **Auth errors:** Check your Supabase URL and anon key
