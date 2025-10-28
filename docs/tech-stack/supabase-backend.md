# Supabase Backend Architecture

## Overview
SwapJoy uses **Supabase** as the Backend-as-a-Service (BaaS) platform, providing a complete backend infrastructure including database, authentication, real-time subscriptions, storage, and auto-generated APIs.

## Why Supabase?

### Advantages
- **Faster Development**: Pre-built backend services
- **PostgreSQL**: Full-featured relational database with PostGIS
- **Auto-generated APIs**: REST and GraphQL APIs from database schema
- **Real-time**: Built-in real-time subscriptions
- **Authentication**: Multiple providers out of the box
- **Storage**: Integrated file storage with CDN
- **Row Level Security**: Database-level security policies
- **Open Source**: Can self-host if needed
- **Cost-effective**: Generous free tier, scalable pricing

## Core Supabase Features Used

### 1. Database (PostgreSQL)
- **Version:** PostgreSQL 15+
- **Extensions:**
  - PostGIS (geospatial queries)
  - pg_trgm (fuzzy text search)
  - uuid-ossp (UUID generation)
  - pgcrypto (encryption)

### 2. Authentication
Pre-configured authentication providers:

#### Email/Password (Regular)
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe',
    }
  }
})
```

#### Google OAuth
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'swapjoy://auth/callback'
  }
})
```

#### Facebook OAuth
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'facebook',
  options: {
    redirectTo: 'swapjoy://auth/callback'
  }
})
```

#### Apple Sign In (iOS)
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: 'swapjoy://auth/callback'
  }
})
```

### 3. Storage
Supabase Storage for images and files:
```typescript
// Upload item image
const { data, error } = await supabase.storage
  .from('images')
  .upload(`${userId}/${itemId}/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('images')
  .getPublicUrl(filePath)
```

**Storage Buckets:**
- `profile-images`: User profile pictures
- `images`: Item listing photos
- `chat-attachments`: Message attachments (future)

### 4. Real-time Subscriptions
Real-time messaging and notifications:
```typescript
// Subscribe to new messages
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      handleNewMessage(payload.new)
    }
  )
  .subscribe()
```

### 5. Edge Functions (Serverless)
For custom backend logic:
- Image processing
- Push notifications
- Email sending
- Complex business logic
- Third-party integrations

**Example:**
```typescript
// supabase/functions/send-offer-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { offerId, receiverId } = await req.json()
  
  // Send push notification
  await sendPushNotification(receiverId, {
    title: 'New Offer!',
    body: 'You have received a new swap offer'
  })
  
  return new Response(JSON.stringify({ success: true }))
})
```

## Database Schema with Row Level Security

### Row Level Security (RLS) Policies

**Users Table:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Public profiles viewable by all authenticated users
CREATE POLICY "Public profiles are viewable"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');
```

**Items Table:**
```sql
-- Anyone can view available items
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (status = 'available' AND is_active = true);

-- Users can insert their own items
CREATE POLICY "Users can create items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items
CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own items
CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

**Offers Table:**
```sql
-- Users can view offers they sent or received
CREATE POLICY "Users can view their offers"
  ON offers FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can create offers
CREATE POLICY "Users can create offers"
  ON offers FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Receivers can update offer status
CREATE POLICY "Receivers can update offers"
  ON offers FOR UPDATE
  USING (auth.uid() = receiver_id);
```

**Messages Table:**
```sql
-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
```

## Supabase Client Configuration

### React Native Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### TypeScript Types

Generate TypeScript types from database:
```bash
npx supabase gen types typescript --project-id "your-project-id" > types/database.types.ts
```

## API Patterns

### REST API (Auto-generated)

```typescript
// Fetch items with filters
const { data: items, error } = await supabase
  .from('items')
  .select(`
    *,
    user:users(id, display_name, profile_image_url, rating_average),
    category:categories(id, name),
    images:item_images(id, image_url, thumbnail_url, is_primary)
  `)
  .eq('status', 'available')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .range(0, 19) // Pagination
```

### Geospatial Queries with PostGIS

```typescript
// Find items within radius
const { data: nearbyItems } = await supabase.rpc('get_nearby_items', {
  user_lat: userLatitude,
  user_lng: userLongitude,
  radius_km: 50
})

// Database function
-- CREATE OR REPLACE FUNCTION get_nearby_items(
--   user_lat FLOAT,
--   user_lng FLOAT,
--   radius_km FLOAT
-- )
-- RETURNS TABLE (
--   id UUID,
--   title TEXT,
--   distance FLOAT
-- ) AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT
--     items.id,
--     items.title,
--     ST_Distance(
--       ST_MakePoint(items.location_lng, items.location_lat)::geography,
--       ST_MakePoint(user_lng, user_lat)::geography
--     ) / 1000 AS distance
--   FROM items
--   WHERE ST_DWithin(
--     ST_MakePoint(items.location_lng, items.location_lat)::geography,
--     ST_MakePoint(user_lng, user_lat)::geography,
--     radius_km * 1000
--   )
--   AND status = 'available'
--   ORDER BY distance;
-- END;
-- $$ LANGUAGE plpgsql;
```

## Edge Functions Use Cases

### 1. Send Push Notifications
```typescript
// supabase/functions/send-push-notification/index.ts
serve(async (req) => {
  const { userId, notification } = await req.json()
  
  // Get user's FCM token
  const { data: user } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', userId)
    .single()
  
  // Send via Firebase Cloud Messaging
  await sendFCM(user.fcm_token, notification)
  
  return new Response(JSON.stringify({ success: true }))
})
```

### 2. Process Image Uploads
```typescript
// supabase/functions/process-image/index.ts
serve(async (req) => {
  const { imagePath } = await req.json()
  
  // Download image
  const { data: imageData } = await supabase.storage
    .from('images')
    .download(imagePath)
  
  // Generate thumbnail, optimize, strip metadata
  const thumbnail = await generateThumbnail(imageData)
  const optimized = await optimizeImage(imageData)
  
  // Upload processed versions
  await supabase.storage
    .from('images')
    .upload(`${imagePath}-thumb`, thumbnail)
  
  return new Response(JSON.stringify({ success: true }))
})
```

### 3. Match Algorithm
```typescript
// supabase/functions/find-matches/index.ts
serve(async (req) => {
  const { userId } = await req.json()
  
  // Complex matching logic
  const matches = await findSmartMatches(userId)
  
  // Store matches
  await supabase
    .from('recommended_matches')
    .insert(matches)
  
  return new Response(JSON.stringify({ matches }))
})
```

## Authentication Flow

### Sign Up Flow
```typescript
// 1. Sign up user
const { data: authData, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe',
    },
    emailRedirectTo: 'swapjoy://auth/verify',
  }
})

// 2. Create user profile (via database trigger or edge function)
// Trigger automatically creates profile from auth.users
```

### Sign In Flow
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})

// Get session
const { data: { session } } = await supabase.auth.getSession()
```

### OAuth Flow
```typescript
// Initiate OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'swapjoy://auth/callback',
    scopes: 'email profile',
  }
})

// Handle callback in app
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // Navigate to home
      }
    }
  )
  
  return () => {
    authListener.subscription.unsubscribe()
  }
}, [])
```

## Performance Optimization

### Database Indexes
```sql
-- Geospatial index
CREATE INDEX idx_items_location ON items USING GIST (
  ST_MakePoint(location_lng, location_lat)::geography
);

-- Search index
CREATE INDEX idx_items_search ON items USING GIN (
  to_tsvector('english', title || ' ' || description)
);

-- Commonly filtered columns
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_status ON items(status) WHERE is_active = true;
CREATE INDEX idx_offers_receiver ON offers(receiver_id, status);
```

### Caching Strategy
- Supabase has built-in caching
- Use React Query for client-side caching
- Cache static data (categories)
- CDN for images via Supabase Storage

## Monitoring & Analytics

### Supabase Dashboard
- Database metrics
- API usage
- Storage usage
- Auth metrics
- Real-time connections

### Custom Analytics
```sql
-- Create materialized view for analytics
CREATE MATERIALIZED VIEW daily_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_swaps,
  AVG(rating) as avg_rating
FROM swaps
GROUP BY DATE(created_at);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_stats;
```

## Cost Estimation

### Free Tier
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

### Pro Plan ($25/month)
- 8 GB database
- 100 GB file storage
- 250 GB bandwidth
- 100,000 monthly active users

**Expected Costs (5,000 active users):**
- Free tier sufficient for MVP
- Pro plan recommended after 1,000 users
- Scale to Team plan as needed

## Migration & Backup

### Automated Backups
- Supabase provides daily backups (Pro plan)
- Point-in-time recovery available

### Local Development
```bash
# Initialize Supabase locally
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --local
```

## Security Best Practices

1. **Always use RLS**: Enable Row Level Security on all tables
2. **Use anon key in client**: Never expose service_role key
3. **Validate on database**: Use constraints and triggers
4. **Audit logs**: Enable audit logging
5. **Regular updates**: Keep Supabase client libraries updated

