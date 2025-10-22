# Supabase Vector AI - Recommendation System

## Overview
SwapJoy uses **Supabase pgvector** for AI-powered semantic matching. This leverages OpenAI embeddings for intelligent item recommendations.

---

## 🎯 **What is pgvector?**

**pgvector** is a PostgreSQL extension for vector similarity search:
- Store vector embeddings in PostgreSQL
- Fast similarity search using cosine distance
- Integrates with OpenAI, Cohere, etc.
- Native to Supabase (already enabled!)

---

## 📊 **Database Setup**

### **Enable pgvector Extension**
```sql
-- Run once in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

### **Items Table with Embeddings**
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category_id UUID,
  estimated_value DECIMAL(10, 2),
  
  -- Vector embedding (1536 dimensions for OpenAI ada-002)
  embedding vector(1536),
  ...
);

-- Create HNSW index for fast similarity search
CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops);
```

### **Bundles - No Separate Table Needed!**

Bundles are **virtual collections** computed on-the-fly:
```typescript
// When user selects multiple items for an offer
const bundle = {
  items: [camera, guitar],
  totalValue: 700,
  totalDiscount: 80,
  // Embedding computed on-the-fly by averaging item embeddings
  embedding: averageEmbeddings([camera.embedding, guitar.embedding])
}
```

**Why no table?**
- ❌ Bundles are temporary (user selects when making offer)
- ❌ Combinations explode (2 items, 3 items, 4 items...)
- ❌ Stale data (items added/removed constantly)
- ✅ Can compute embeddings on-the-fly (simple averaging)
- ✅ YAGNI - Don't store what you can compute

---

## 🤖 **How It Works**

### **1. Generate Embeddings (When Item is Created)**

```typescript
// Supabase Edge Function: generate-embedding
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { itemId } = await req.json()
  
  // Get item details
  const { data: item } = await supabase
    .from('items')
    .select('title, description, category_id')
    .eq('id', itemId)
    .single()
  
  // Get category name
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', item.category_id)
    .single()
  
  // Create text for embedding
  const text = `${item.title}. ${item.description}. Category: ${category.name}`
  
  // Generate embedding using OpenAI
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002'
    })
  })
  
  const { data } = await response.json()
  const embedding = data[0].embedding
  
  // Store embedding in database
  await supabase
    .from('items')
    .update({ embedding })
    .eq('id', itemId)
  
  return new Response(JSON.stringify({ success: true }))
})
```

### **2. Find Similar Items (Semantic Search)**

```typescript
// Find items similar to user's item
async function findSimilarItems(userItemId: string, limit = 20) {
  // Get user's item embedding
  const { data: userItem } = await supabase
    .from('items')
    .select('embedding, estimated_value, max_discount_amount, user_id')
    .eq('id', userItemId)
    .single()
  
  const minValue = userItem.estimated_value - userItem.max_discount_amount
  
  // Find similar items using vector similarity
  const { data: similarItems } = await supabase.rpc('match_items', {
    query_embedding: userItem.embedding,
    match_threshold: 0.7, // Similarity threshold (0-1)
    match_count: limit,
    min_value: minValue,
    exclude_user_id: userItem.user_id
  })
  
  return similarItems
}
```

### **3. Database Function for Vector Search**

```sql
-- Create function for semantic item matching
CREATE OR REPLACE FUNCTION match_items(
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT,
  min_value DECIMAL,
  exclude_user_id UUID
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  estimated_value DECIMAL,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.title,
    items.description,
    items.estimated_value,
    1 - (items.embedding <=> query_embedding) as similarity
  FROM items
  WHERE 
    items.status = 'available'
    AND items.user_id != exclude_user_id
    AND items.estimated_value >= min_value
    AND 1 - (items.embedding <=> query_embedding) > match_threshold
  ORDER BY items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 🎯 **Your Example with Vectors**

### **User A's Items:**

**Camera ($200, discount $30):**
```typescript
// Embedding generated from:
"Vintage Canon AE-1 Camera. Great condition, works perfectly. 
Includes original lens. Category: Digital"

embedding: [0.023, -0.015, 0.042, ...] // 1536 dimensions
```

**Guitar ($500, discount $50):**
```typescript
// Embedding generated from:
"Acoustic Guitar Yamaha FG800. Excellent sound quality, 
barely used. Category: Musical Instruments"

embedding: [0.031, 0.018, -0.025, ...] // 1536 dimensions
```

### **Bundle (Camera + Guitar) - Computed On-the-Fly:**
```typescript
// When user selects both items for an offer:
const bundleEmbedding = averageEmbeddings([
  camera.embedding,  // [0.023, -0.015, 0.042, ...]
  guitar.embedding   // [0.031, 0.018, -0.025, ...]
])
// Result: [0.027, 0.0015, 0.0085, ...] // Simple average

// OR generate fresh embedding:
const text = `${camera.title}. ${guitar.title}. ${camera.description}. ${guitar.description}`
const bundleEmbedding = await generateEmbedding(text)
```

### **Finding Matches:**

```typescript
// 1. Find matches for Camera
const cameraMatches = await supabase.rpc('match_items', {
  query_embedding: camera.embedding,
  match_threshold: 0.7,
  match_count: 20,
  min_value: 170, // $200 - $30 discount
  exclude_user_id: userA.id
})

// Results (sorted by similarity):
// 1. "Digital Camera Nikon D3500" - similarity: 0.92
// 2. "DSLR Camera Canon EOS" - similarity: 0.88
// 3. "Vintage Film Camera" - similarity: 0.85
// 4. "GoPro Action Camera" - similarity: 0.78
// 5. "Photography Lens Kit" - similarity: 0.76
```

**Why this is better than keyword search:**
- "Photography Lens Kit" matches even though it's not a camera
- "GoPro" matches even though it's action camera, not vintage
- Semantic understanding, not just keywords

---

## 🎨 **Combine Vector Search with Filters**

```typescript
async function getRecommendations(userId: string) {
  // Get user's items and preferences
  const { data: user } = await supabase
    .from('users')
    .select('id, favorite_categories')
    .eq('id', userId)
    .single()
  
  const { data: userItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'available')
  
  // For each item, find similar matches
  const allRecommendations = []
  
  for (const item of userItems) {
    const minValue = item.estimated_value - item.max_discount_amount
    const maxValue = item.estimated_value * 2 // Up to 2x value
    
    // Vector similarity search with value filter
    const { data: matches } = await supabase.rpc('match_items_advanced', {
      query_embedding: item.embedding,
      match_threshold: 0.6,
      match_count: 10,
      min_value: minValue,
      max_value: maxValue,
      favorite_categories: user.favorite_categories,
      exclude_user_id: userId
    })
    
    allRecommendations.push(...matches)
  }
  
  // Remove duplicates and sort by overall score
  const unique = deduplicateAndScore(allRecommendations)
  
  return unique.slice(0, 20) // Top 20 recommendations
}
```

### **Advanced Matching Function:**

```sql
CREATE OR REPLACE FUNCTION match_items_advanced(
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT,
  min_value DECIMAL,
  max_value DECIMAL,
  favorite_categories UUID[],
  exclude_user_id UUID
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  estimated_value DECIMAL,
  category_id UUID,
  similarity FLOAT,
  value_score FLOAT,
  category_score FLOAT,
  overall_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.title,
    items.estimated_value,
    items.category_id,
    1 - (items.embedding <=> query_embedding) as similarity,
    
    -- Value match score (0-1)
    CASE 
      WHEN items.estimated_value >= min_value AND items.estimated_value <= max_value
      THEN 1.0 - ABS(items.estimated_value - min_value) / (max_value - min_value)
      ELSE 0.5
    END as value_score,
    
    -- Category match score (0-1)
    CASE 
      WHEN items.category_id = ANY(favorite_categories) THEN 1.0
      ELSE 0.5
    END as category_score,
    
    -- Overall score (weighted average)
    (
      (1 - (items.embedding <=> query_embedding)) * 0.4 + -- 40% similarity
      (CASE WHEN items.estimated_value >= min_value AND items.estimated_value <= max_value
           THEN 1.0 - ABS(items.estimated_value - min_value) / (max_value - min_value)
           ELSE 0.5 END) * 0.4 + -- 40% value
      (CASE WHEN items.category_id = ANY(favorite_categories) THEN 1.0 ELSE 0.5 END) * 0.2 -- 20% category
    ) as overall_score
    
  FROM items
  WHERE 
    items.status = 'available'
    AND items.user_id != exclude_user_id
    AND 1 - (items.embedding <=> query_embedding) > match_threshold
  ORDER BY overall_score DESC
  LIMIT match_count;
END;
$$;
```

---

## 📱 **Mobile App Integration**

```typescript
// In your React Native app
import { supabase } from './lib/supabase'

async function loadExploreScreen(userId: string) {
  // Call Edge Function to get recommendations
  const { data, error } = await supabase.functions.invoke('get-recommendations', {
    body: { userId }
  })
  
  return data.recommendations
}
```

---

## ⚡ **Performance & Costs**

### **Embedding Generation:**
- **When:** When item is created/updated
- **Cost:** ~$0.0001 per item (OpenAI ada-002)
- **Time:** ~200ms per item

### **Vector Search:**
- **Speed:** <50ms for similarity search (with HNSW index)
- **Cost:** Free (runs in Supabase)
- **Scale:** Handles millions of items efficiently

### **Optimization:**
1. **Cache embeddings** - Generate once, use many times
2. **HNSW index** - Fast approximate nearest neighbor search
3. **Batch processing** - Generate embeddings in bulk
4. **Smart triggers** - Only regenerate if title/description changes

---

## 🎓 **Benefits of Supabase Vector**

### **vs Custom Algorithm:**
✅ **Smarter** - Understands semantic meaning  
✅ **Faster** - Built-in HNSW indexing  
✅ **Easier** - No custom ML code needed  
✅ **Better matches** - AI understands context  
✅ **Native** - Built into Supabase  
✅ **Scalable** - Handles millions of vectors  

### **vs Traditional Search:**
- "Guitar" matches "Musical instrument", "String instrument", "Bass", etc.
- "Camera" matches "Photography equipment", "Lens", "Tripod", etc.
- Understands context and relationships

---

## 🚀 **Setup Checklist**

1. ✅ Enable pgvector extension in Supabase
2. ✅ Add embedding column to items table
3. ✅ Create HNSW index
4. ✅ Add OpenAI API key to Supabase secrets
5. ✅ Create Edge Function for embedding generation
6. ✅ Create database function for similarity search
7. ✅ Test with sample items

---

## 📝 **Summary**

**Use Supabase's built-in vector capabilities:**
- ✅ `pgvector` extension (already in Supabase)
- ✅ OpenAI embeddings via Edge Functions
- ✅ HNSW indexes for fast search
- ✅ SQL functions for matching logic
- ✅ No external AI service needed

**Much simpler and more powerful than custom algorithms!** 🎉

