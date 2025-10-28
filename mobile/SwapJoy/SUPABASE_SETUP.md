# Supabase Setup for SwapJoy Mobile App

Complete setup guide for Supabase backend configuration.

## 📋 **Table of Contents**

1. [Initial Configuration](#1-initial-configuration)
2. [Database Setup](#2-database-setup)
3. [Storage Buckets](#3-storage-buckets)
4. [Edge Functions](#4-edge-functions)
5. [Environment Variables](#5-environment-variables)
6. [Authentication](#6-authentication)
7. [Testing](#7-testing)

---

## **1. Initial Configuration**

### **Get Your Supabase Credentials:**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (e.g., `https://glbvyusqksnoyjuztceo.supabase.co`)
   - **Project Ref** (e.g., `glbvyusqksnoyjuztceo`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (for Edge Functions only - keep secret!)

### **Update App Configuration:**

Edit `config/supabase.ts` and replace the placeholder values:

```typescript
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## **2. Database Setup**

### **Enable Required Extensions:**

Go to **Database** → **Extensions** and enable:
- ✅ `vector` (pgvector for AI embeddings)
- ✅ `pg_net` (for HTTP requests from triggers)
- ✅ `uuid-ossp` (UUID generation - usually enabled by default)

Or run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Create Database Tables:**

Run the following SQL scripts in **SQL Editor**:

#### **Items Table:**

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Item Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  
  -- Condition & Value
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- AI/Vector Embeddings
  embedding vector(1536),
  
  -- Status
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'swapped', 'hidden', 'deleted')),
  
  -- Location
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_location ON items(location_lat, location_lng);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_embedding ON items USING hnsw (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (status = 'available');

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

#### **Item Images Table:**

```sql
CREATE TABLE item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_item_images_item_id ON item_images(item_id);
CREATE INDEX idx_item_images_sort_order ON item_images(item_id, sort_order);

-- Enable RLS
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Item images are viewable by everyone"
  ON item_images FOR SELECT
  USING (true);

CREATE POLICY "Users can insert images for their own items"
  ON item_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_images.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images for their own items"
  ON item_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_images.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for their own items"
  ON item_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_images.item_id
      AND items.user_id = auth.uid()
    )
  );
```

#### **Categories Table:**

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Seed categories
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
  ('Electronics', 'electronics', 'Phones, laptops, cameras, and other electronic devices', 1, true),
  ('Clothing', 'clothing', 'Shirts, pants, shoes, and accessories', 2, true),
  ('Books', 'books', 'Fiction, non-fiction, textbooks, and magazines', 3, true),
  ('Furniture', 'furniture', 'Tables, chairs, sofas, and home furnishings', 4, true),
  ('Sports', 'sports', 'Sports equipment, bikes, and fitness gear', 5, true),
  ('Toys & Games', 'toys-games', 'Toys, board games, and video games', 6, true),
  ('Home & Garden', 'home-garden', 'Home decor, tools, and garden equipment', 7, true),
  ('Art & Collectibles', 'art-collectibles', 'Artwork, antiques, and collectible items', 8, true),
  ('Musical Instruments', 'musical-instruments', 'Guitars, keyboards, drums, and other instruments', 9, true),
  ('Other', 'other', 'Everything else', 10, true)
ON CONFLICT (slug) DO NOTHING;
```

### **Create Database Triggers:**

⚠️ **Important:** Replace `YOUR_PROJECT_REF` and `YOUR_INTERNAL_FUNCTION_SECRET` before running!

```sql
-- Trigger function to generate embeddings via Edge Function
CREATE OR REPLACE FUNCTION trigger_generate_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id bigint;
BEGIN
  SELECT INTO request_id net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-embedding',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', 'YOUR_INTERNAL_FUNCTION_SECRET'
    ),
    body := jsonb_build_object('itemId', NEW.id::text)
  );
  
  RETURN NEW;
END;
$$;

-- Trigger on INSERT
CREATE TRIGGER on_item_insert_generate_embedding
  AFTER INSERT ON items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_embedding();

-- Trigger on UPDATE (only when title, description, or category changes)
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

---

## **3. Storage Buckets**

### **Create Storage Bucket:**

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Create a bucket named `images`
4. Set to **Public** (for item images)

### **Set Storage Policies:**

Go to **Storage** → **Policies** and create:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow public read access
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## **4. Edge Functions**

### **Deploy `generate-embedding` Function:**

This function is already deployed using the MCP tools, but here's the code for reference:

```typescript
// supabase/functions/generate-embedding/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // SECURITY: Check for internal secret header
  const internalSecret = req.headers.get('x-internal-secret');
  const expectedSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET');
  
  if (!internalSecret || internalSecret !== expectedSecret) {
    console.error('Unauthorized: Invalid or missing internal secret');
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Internal use only' }),
      { headers: { 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { itemId } = await req.json();
    if (!itemId) {
      return new Response(
        JSON.stringify({ error: 'itemId is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing embedding for item ${itemId}`);

    // Get item details
    const { data: item, error: itemError } = await supabaseClient
      .from('items')
      .select('title, description, category_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      console.error('Error fetching item:', itemError?.message || 'Item not found');
      return new Response(
        JSON.stringify({ error: itemError?.message || 'Item not found' }),
        { headers: { 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get category name
    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select('name')
      .eq('id', item.category_id)
      .single();

    if (categoryError || !category) {
      console.warn('Warning: Category not found for item, proceeding without category name.');
    }

    // Create text for embedding
    const categoryName = category ? category.name : '';
    const text = `${item.title}. ${item.description}. Category: ${categoryName}`;

    console.log(`Generating embedding for text: ${text.substring(0, 100)}...`);

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

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${errorData.message || openaiResponse.statusText}` }),
        { headers: { 'Content-Type': 'application/json' }, status: openaiResponse.status }
      );
    }

    const { data } = await openaiResponse.json();
    const embedding = data[0].embedding;

    console.log(`Embedding generated, length: ${embedding.length}`);

    // Store embedding in database
    const { error: updateError } = await supabaseClient
      .from('items')
      .update({ embedding })
      .eq('id', itemId);

    if (updateError) {
      console.error('Error updating item with embedding:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Successfully generated and stored embedding for item ${itemId}`);
    return new Response(
      JSON.stringify({ success: true, itemId, embeddingLength: embedding.length }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

### **Function Configuration:**

1. Go to **Edge Functions** → **generate-embedding** → **Settings**
2. **Disable "Verify JWT"** (important! triggers don't send JWT)
3. JWT verification is disabled because the function uses custom header-based authentication

---

## **5. Environment Variables**

### **Set Edge Function Secrets:**

Go to **Edge Functions** → **generate-embedding** → **Secrets** and add:

| Name | Value | Description |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Your OpenAI API key from platform.openai.com |
| `INTERNAL_FUNCTION_SECRET` | `YOUR_SECRET_HERE` | Random secret string (use same value in trigger SQL) |
| `SUPABASE_URL` | (Auto-set) | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | (Auto-set) | Service role key with elevated permissions |

**To generate a secure secret:**

```bash
# Generate a random base64 secret
openssl rand -base64 32
```

---

## **6. Authentication**

### **Configure Phone Authentication:**

1. Go to **Authentication** → **Providers**
2. Enable **Phone** provider
3. Configure SMS provider (Twilio recommended)
4. Set confirmation URL: `swapjoy://auth/confirm`

### **Configure Deep Linking (Optional for OAuth):**

```typescript
// app.json
{
  "expo": {
    "scheme": "swapjoy",
    "ios": {
      "bundleIdentifier": "com.swapjoy.app"
    },
    "android": {
      "package": "com.swapjoy.app"
    }
  }
}
```

---

## **7. Testing**

### **Test Database Setup:**

```sql
-- Check if extensions are enabled
SELECT * FROM pg_extension WHERE extname IN ('vector', 'pg_net', 'uuid-ossp');

-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check if triggers exist
SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'items';

-- Test categories
SELECT * FROM categories WHERE is_active = true ORDER BY sort_order;
```

### **Test Storage:**

1. Upload a test image via the app
2. Check **Storage** → **images** bucket
3. Verify the image is accessible via public URL

### **Test Edge Function:**

Only accessible internally - test by creating a new item in the app and checking:

```sql
-- Check if embedding was generated
SELECT id, title, embedding IS NOT NULL as has_embedding
FROM items
ORDER BY created_at DESC
LIMIT 5;
```

### **View Edge Function Logs:**

Go to **Edge Functions** → **generate-embedding** → **Logs** to see:
- Function invocations
- Success/error messages
- Performance metrics

---

## **✅ Checklist**

- [ ] Database extensions enabled (`vector`, `pg_net`)
- [ ] Tables created (`items`, `item_images`, `categories`)
- [ ] Categories seeded
- [ ] RLS policies enabled
- [ ] Triggers created and configured with correct URL and secret
- [ ] Storage bucket `images` created
- [ ] Storage policies set
- [ ] Edge Function `generate-embedding` deployed
- [ ] Edge Function JWT verification disabled
- [ ] Edge Function secrets set (`OPENAI_API_KEY`, `INTERNAL_FUNCTION_SECRET`)
- [ ] Phone authentication enabled
- [ ] App configuration updated with Supabase URL and keys

---

## **🔍 Troubleshooting**

### **Embeddings not generating:**
- Check Edge Function logs for errors
- Verify `OPENAI_API_KEY` is set correctly
- Ensure `INTERNAL_FUNCTION_SECRET` matches in both trigger and Edge Function
- Confirm JWT verification is disabled on the function
- Check that triggers are firing: `SELECT * FROM pg_stat_user_functions WHERE funcname = 'trigger_generate_embedding';`

### **Storage upload errors:**
- Verify bucket policies are set correctly
- Check that bucket is public
- Ensure user is authenticated

### **Database errors:**
- Check RLS policies are not too restrictive
- Verify foreign key relationships
- Check constraint violations (condition, status values)

---

## **📚 Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Storage Guide](https://supabase.com/docs/guides/storage)
