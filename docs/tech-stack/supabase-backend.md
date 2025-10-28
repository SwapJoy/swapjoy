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

### 1. Generate AI Embeddings (Implemented) ✅

**Purpose:** Automatically generate OpenAI embeddings for semantic item search when items are created or updated.

```typescript
// supabase/functions/generate-embedding/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // SECURITY: Internal-only function, protected by custom header
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== Deno.env.get('INTERNAL_FUNCTION_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { itemId } = await req.json();

  // Fetch item details
  const { data: item } = await supabaseClient
    .from('items')
    .select('title, description, category_id')
    .eq('id', itemId)
    .single();

  // Get category name for context
  const { data: category } = await supabaseClient
    .from('categories')
    .select('name')
    .eq('id', item.category_id)
    .single();

  // Create text for embedding
  const text = `${item.title}. ${item.description}. Category: ${category?.name || ''}`;

  // Generate embedding using OpenAI
  const openaiResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  });

  const { data } = await openaiResponse.json();
  const embedding = data[0].embedding;

  // Store embedding in database
  await supabaseClient
    .from('items')
    .update({ embedding })
    .eq('id', itemId);

  return new Response(JSON.stringify({ success: true }));
});
```

**Database Trigger:**
```sql
-- Automatically call Edge Function when item is created or updated
CREATE OR REPLACE FUNCTION trigger_generate_embedding()
RETURNS trigger AS $$
DECLARE
  request_id bigint;
BEGIN
  SELECT INTO request_id net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-embedding',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', 'YOUR_SECRET_HERE'
    ),
    body := jsonb_build_object('itemId', NEW.id::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_item_insert_generate_embedding
  AFTER INSERT ON items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_embedding();

CREATE TRIGGER on_item_update_generate_embedding
  AFTER UPDATE OF title, description, category_id ON items
  FOR EACH ROW
  WHEN (
    OLD.title IS DISTINCT FROM NEW.title OR 
    OLD.description IS DISTINCT FROM NEW.description OR 
    OLD.category_id IS DISTINCT FROM NEW.category_id
  )
  EXECUTE FUNCTION trigger_generate_embedding();
```

**Security:**
- Function is **internal-only** (not publicly accessible)
- Protected by custom `x-internal-secret` header
- JWT verification disabled (triggers don't send JWT)
- Uses service role key for database access

### 2. Send Push Notifications (Future)
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

### 3. Process Image Uploads (Future)
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

## AI & Vector Search (pgvector)

### Overview

SwapJoy uses **pgvector** extension for semantic search and AI-powered item matching using OpenAI embeddings.

### Setup

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to items table
ALTER TABLE items ADD COLUMN embedding vector(1536);

-- Create HNSW index for fast similarity search
CREATE INDEX idx_items_embedding ON items 
USING hnsw (embedding vector_cosine_ops);
```

### Embedding Generation

Embeddings are automatically generated when:
- A new item is created
- An existing item's title, description, or category is updated

**Process:**
1. Database trigger fires on INSERT/UPDATE
2. Trigger calls `generate-embedding` Edge Function via `pg_net`
3. Edge Function fetches item details and category
4. Creates text: `"${title}. ${description}. Category: ${category}"`
5. Calls OpenAI API to generate embedding (1536 dimensions)
6. Stores embedding in `items.embedding` column

### Semantic Search

```typescript
// Find similar items based on embedding similarity
const { data: similarItems } = await supabase.rpc('match_items', {
  query_embedding: userItemEmbedding,
  match_threshold: 0.7,  // Minimum similarity (0-1)
  match_count: 10
});
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION match_items(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.title,
    items.description,
    1 - (items.embedding <=> query_embedding) AS similarity
  FROM items
  WHERE 
    items.status = 'available'
    AND 1 - (items.embedding <=> query_embedding) > match_threshold
  ORDER BY items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

### AI-Powered Recommendations

**Recently Listed (Relevance Sort):**

```typescript
// Get recently listed items sorted by relevance to user's items
const { data } = await ApiService.getRecentlyListed(userId, 10);
```

**Algorithm:**
1. Fetch user's items with embeddings
2. Get recent items from the last 30 days
3. Calculate average cosine similarity between user's items and each recent item
4. Boost score for more recent items (up to 20%)
5. Sort by overall score (similarity + recency boost)
6. Filter by user's favorite categories (if set)

**Implementation:**
```typescript
// Calculate similarity scores for recent items
const itemsWithScores = await Promise.all(
  recentItems.map(async (item) => {
    // Calculate average similarity to user's items
    let totalSimilarity = 0;
    for (const userItem of userItems) {
      const { data } = await supabase.rpc('match_items_cosine', {
        query_embedding: userItem.embedding,
        target_item_id: item.id
      });
      totalSimilarity += data[0].similarity || 0;
    }
    const avgSimilarity = totalSimilarity / userItems.length;
    
    // Add recency boost
    const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) 
      / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, (30 - daysSinceCreated) / 30) * 0.2;
    
    return {
      ...item,
      similarity_score: avgSimilarity,
      overall_score: Math.min(1, avgSimilarity + recencyBoost)
    };
  })
);

// Sort by overall score
const sortedItems = itemsWithScores
  .sort((a, b) => b.overall_score - a.overall_score)
  .slice(0, limit);
```

### Vector Operations

pgvector supports three distance operators:

| Operator | Description | Use Case |
|----------|-------------|----------|
| `<->` | L2 distance (Euclidean) | General similarity |
| `<#>` | Inner product | Magnitude-aware |
| `<=>` | Cosine distance | Direction-based (used in SwapJoy) |

**Why Cosine Distance?**
- Measures angle between vectors (not magnitude)
- Better for text embeddings (OpenAI uses normalized vectors)
- Range: 0 (identical) to 2 (opposite)
- Similarity = 1 - cosine_distance

### Performance Optimization

**HNSW Index:**
```sql
-- Hierarchical Navigable Small World index
CREATE INDEX idx_items_embedding ON items 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Parameters:**
- `m = 16`: Number of connections per layer (higher = more accurate, slower build)
- `ef_construction = 64`: Size of dynamic candidate list (higher = more accurate)

**Query Performance:**
- Without index: O(n) - scans all rows
- With HNSW index: O(log n) - approximate nearest neighbors
- Typical query time: < 50ms for 10K items

### Cost Considerations

**OpenAI API Costs (text-embedding-ada-002):**
- $0.0001 per 1K tokens
- Average item: ~100 tokens = $0.00001 per embedding
- 10,000 items = $0.10

**Storage:**
- Each embedding: 1536 dimensions × 4 bytes = 6.144 KB
- 10,000 items: ~60 MB
- Negligible compared to image storage

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

