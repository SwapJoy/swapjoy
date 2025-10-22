# Home Screen Sections - Implementation Guide

## Overview
The home screen displays 5 sections of personalized recommendations using AI-powered matching and smart algorithms.

---

## 📱 **Home Screen Sections**

### **1. Top Picks for You** 🎯
**Goal:** Best overall matches combining semantic similarity + value + category preferences

**Algorithm:**
```typescript
async function getTopPicks(userId: string, limit: number = 10) {
  // Get user's items and preferences
  const { data: user } = await supabase
    .from('users')
    .select('favorite_categories')
    .eq('id', userId)
    .single()
  
  const { data: userItems } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'available')
  
  // Calculate average embedding for user's items
  const avgEmbedding = averageEmbeddings(userItems.map(i => i.embedding))
  const avgValue = average(userItems.map(i => i.estimated_value))
  
  // Find matches with combined scoring
  const { data: matches } = await supabase.rpc('get_top_picks', {
    query_embedding: avgEmbedding,
    user_value: avgValue,
    favorite_categories: user.favorite_categories,
    exclude_user_id: userId,
    match_limit: limit
  })
  
  return matches
}
```

**SQL Function:**
```sql
CREATE OR REPLACE FUNCTION get_top_picks(
  query_embedding vector(1536),
  user_value DECIMAL,
  favorite_categories UUID[],
  exclude_user_id UUID,
  match_limit INT
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  estimated_value DECIMAL,
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
    
    -- Semantic similarity (0-1)
    1 - (items.embedding <=> query_embedding) as similarity,
    
    -- Value score with similarity-based tolerance
    CASE 
      WHEN 1 - (items.embedding <=> query_embedding) >= 0.9 
        THEN GREATEST(0, 1 - ABS(items.estimated_value - user_value) / (user_value * 0.30))
      WHEN 1 - (items.embedding <=> query_embedding) >= 0.8
        THEN GREATEST(0, 1 - ABS(items.estimated_value - user_value) / (user_value * 0.20))
      WHEN 1 - (items.embedding <=> query_embedding) >= 0.7
        THEN GREATEST(0, 1 - ABS(items.estimated_value - user_value) / (user_value * 0.15))
      ELSE GREATEST(0, 1 - ABS(items.estimated_value - user_value) / (user_value * 0.10))
    END as value_score,
    
    -- Category score
    CASE 
      WHEN items.category_id = ANY(favorite_categories) THEN 1.0
      ELSE 0.5
    END as category_score,
    
    -- Overall score (weighted average)
    (
      (1 - (items.embedding <=> query_embedding)) * 0.50 + -- 50% similarity
      (CASE WHEN 1 - (items.embedding <=> query_embedding) >= 0.9 
            THEN GREATEST(0, 1 - ABS(items.estimated_value - user_value) / (user_value * 0.30))
            ELSE GREATEST(0, 1 - ABS(items.estimated_value - user_value) / (user_value * 0.15))
       END) * 0.30 + -- 30% value
      (CASE WHEN items.category_id = ANY(favorite_categories) THEN 1.0 ELSE 0.5 END) * 0.20 -- 20% category
    ) as overall_score
    
  FROM items
  WHERE 
    items.status = 'available'
    AND items.user_id != exclude_user_id
    AND 1 - (items.embedding <=> query_embedding) > 0.6
  ORDER BY overall_score DESC
  LIMIT match_limit;
END;
$$;
```

**Key:** Similarity score determines value tolerance automatically!
- 0.9+ similarity → 30% value tolerance
- 0.8+ similarity → 20% value tolerance  
- 0.7+ similarity → 15% value tolerance
- 0.6+ similarity → 10% value tolerance

---

### **2. Similar Cost** 💰
**Goal:** Items with similar value, any category

**Algorithm:**
```sql
CREATE OR REPLACE FUNCTION get_similar_cost_items(
  user_value DECIMAL,
  exclude_user_id UUID,
  match_limit INT
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  estimated_value DECIMAL,
  value_difference DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.title,
    items.estimated_value,
    ABS(items.estimated_value - user_value) as value_difference
  FROM items
  WHERE 
    items.status = 'available'
    AND items.user_id != exclude_user_id
    AND items.estimated_value BETWEEN (user_value * 0.8) AND (user_value * 1.2)
  ORDER BY ABS(items.estimated_value - user_value) ASC
  LIMIT match_limit;
END;
$$;
```

**For bundles:**
```sql
-- Similar cost bundles
SELECT 
  user_id,
  array_agg(id) as item_ids,
  SUM(estimated_value) as total_value,
  ABS(SUM(estimated_value) - user_total_value) as value_diff
FROM items
WHERE status = 'available' AND user_id != current_user
GROUP BY user_id
HAVING 
  SUM(estimated_value) BETWEEN (user_total_value * 0.8) AND (user_total_value * 1.2)
  AND COUNT(*) BETWEEN 2 AND 4
ORDER BY ABS(SUM(estimated_value) - user_total_value) ASC
LIMIT 10;
```

---

### **3. Similar Categories** 🏷️
**Goal:** Items in same/favorite categories, any price

**Algorithm:**
```sql
CREATE OR REPLACE FUNCTION get_similar_category_items(
  user_categories UUID[],
  favorite_categories UUID[],
  exclude_user_id UUID,
  match_limit INT
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  category_id UUID,
  estimated_value DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.title,
    items.category_id,
    items.estimated_value
  FROM items
  WHERE 
    items.status = 'available'
    AND items.user_id != exclude_user_id
    AND (
      items.category_id = ANY(user_categories) OR 
      items.category_id = ANY(favorite_categories)
    )
  ORDER BY 
    CASE WHEN items.category_id = ANY(favorite_categories) THEN 1 ELSE 2 END,
    created_at DESC
  LIMIT match_limit;
END;
$$;
```

---

### **4. Recently Added** 🆕
**Goal:** Newest items and bundles

**Algorithm:**
```sql
-- Single items
SELECT * FROM items
WHERE status = 'available'
ORDER BY created_at DESC
LIMIT 10;

-- Recent bundles
SELECT 
  user_id,
  array_agg(id ORDER BY created_at DESC) as item_ids,
  SUM(estimated_value) as total_value,
  MAX(created_at) as latest_item_date
FROM items
WHERE status = 'available'
GROUP BY user_id
HAVING COUNT(*) >= 2
ORDER BY MAX(created_at) DESC
LIMIT 10;
```

---

### **5. More** 🎲
**Goal:** Random discovery

**Algorithm:**
```sql
-- Random items
SELECT * FROM items
WHERE status = 'available'
ORDER BY RANDOM()
LIMIT 10;

-- Or for better performance on large tables:
SELECT * FROM items TABLESAMPLE BERNOULLI(5)
WHERE status = 'available'
LIMIT 10;
```

---

## ✅ **Conclusion**

**YES, REMOVE max_discount_amount!**

### **Benefits:**
1. ✅ Simpler schema
2. ✅ Better UX (one less field)
3. ✅ Smarter matching (similarity-aware tolerance)
4. ✅ More flexible algorithm
5. ✅ Can tune without user input
6. ✅ All home screen sections still work perfectly

### **How value matching works:**
```
High similarity (0.9) + $160 item vs $200 user item
→ 30% tolerance → $140-$260 range → ✅ Match!

Low similarity (0.6) + $160 item vs $200 user item  
→ 10% tolerance → $180-$220 range → ❌ No match

Semantic match quality determines value flexibility!
```

**This is the right design decision.** 🎯

Shall I proceed with removing it?
