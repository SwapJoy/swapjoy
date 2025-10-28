# Database Schema

## Entity Relationship Overview

```
Users ──< Items
Users ──< Offers
Users ──< Messages
Users ──< Reviews
Users ──< Notifications
Users ──< Favorites
Users ──< Wishlists
Items ──< Offers
Items ──< Favorites
Items ──< ItemImages
Offers ──< OfferItems
Conversations ──< Messages
```

## Tables/Collections

### 1. Users
Primary table for user accounts and profiles.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY, -- References auth.users(id) from Supabase Auth
  
  -- Profile
  username VARCHAR(50) UNIQUE NOT NULL, -- NEW: Unique username
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  
  -- Contact (synced from auth.users)
  email VARCHAR(255),
  phone_number VARCHAR(20),
  
  -- Location
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  
  -- Verification (synced from auth.users)
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE, -- Manual verification by admin
  
  -- Status (replaced is_active/is_banned with status field)
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, banned, deleted
  
  -- Preferences
  favorite_categories UUID[], -- Array of category IDs user is interested in
  preferred_radius_km DECIMAL(5, 2) DEFAULT 50.00, -- Search radius in kilometers
  
  -- Manual Location (alternative to current location)
  manual_location_lat DECIMAL(10, 8), -- User-selected location latitude
  manual_location_lng DECIMAL(11, 8), -- User-selected location longitude
  
  -- Settings
  notification_preferences JSONB DEFAULT '{}',
  privacy_settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_phone (phone_number),
  INDEX idx_status (status),
  INDEX idx_location (location_lat, location_lng),
  INDEX idx_manual_location (manual_location_lat, manual_location_lng),
  INDEX idx_created_at (created_at)
);

-- Note: Authentication is handled by Supabase Auth (auth.users table)
-- MVP: Phone number authentication only
-- Future: Email, Google, Apple, Facebook authentication available
-- password_hash is stored in auth.users, not in public.users
-- This users table is created automatically via trigger when user signs up
```

### 2. Cities
Available cities/regions where items can be listed.

```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state_province VARCHAR(100), -- State/Province/Region
  
  -- City center coordinates (used for item location)
  center_lat DECIMAL(10, 8) NOT NULL,
  center_lng DECIMAL(11, 8) NOT NULL,
  
  -- Optional metadata
  timezone VARCHAR(50),
  population INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_country (country),
  INDEX idx_center_location (center_lat, center_lng),
  UNIQUE(name, country, state_province)
);

-- Example data:
-- INSERT INTO cities (name, country, state_province, center_lat, center_lng)
-- VALUES ('San Francisco', 'USA', 'California', 37.7749, -122.4194);
```

### 3. Items
Items listed for swapping.

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Item Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  
  -- Condition & Value
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  price DECIMAL(10, 2), -- Renamed from estimated_value
  currency VARCHAR(3) DEFAULT 'USD', -- ISO 4217: USD, EUR, GBP, JPY, etc.
  
  -- AI/Vector Embeddings (Supabase pgvector)
  embedding vector(1536), -- OpenAI ada-002 embeddings for semantic search
  
  -- Status (replaced is_active with status field)
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'swapped', 'hidden', 'deleted')),
  -- available: active and visible
  -- pending: offer accepted, swap in progress
  -- swapped: item has been swapped
  -- hidden: user temporarily hid the item
  -- deleted: user deleted the listing
  
  -- Location (coordinates only, no city reference)
  location_lat DECIMAL(10, 8), -- Copied from selected city in UI
  location_lng DECIMAL(11, 8), -- Copied from selected city in UI
  
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

-- Create vector index for similarity search (HNSW - fast and efficient)
CREATE INDEX idx_items_embedding ON items USING hnsw (embedding vector_cosine_ops);

-- Enable Row Level Security
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

-- Trigger on INSERT to generate embeddings for new items
CREATE TRIGGER on_item_insert_generate_embedding
  AFTER INSERT ON items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_embedding();

-- Trigger on UPDATE to regenerate embeddings when relevant fields change
CREATE TRIGGER on_item_update_generate_embedding
  AFTER UPDATE OF title, description, category_id ON items
  FOR EACH ROW
  WHEN (
    OLD.title IS DISTINCT FROM NEW.title OR 
    OLD.description IS DISTINCT FROM NEW.description OR 
    OLD.category_id IS DISTINCT FROM NEW.category_id
  )
  EXECUTE FUNCTION trigger_generate_embedding();

-- Notes:
-- 1. Renamed: estimated_value → price
-- 2. Added: CHECK constraints for condition and status
-- 3. Added: RLS policies for secure access
-- 4. Added: Triggers for automatic embedding generation
-- 5. Requires: vector extension for embeddings, pg_net for HTTP requests
```

### 4. Item Images
Multiple images per item.

```sql
CREATE TABLE item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0, -- Renamed from display_order
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_item_images_item_id ON item_images(item_id);
CREATE INDEX idx_item_images_sort_order ON item_images(item_id, sort_order);

-- Enable Row Level Security
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

### 5. Item Metrics
Separate table for item statistics (updated via triggers/queries).

```sql
CREATE TABLE item_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID UNIQUE NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  
  -- View metrics
  view_count INTEGER DEFAULT 0,
  unique_view_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  favorite_count INTEGER DEFAULT 0,
  offer_count INTEGER DEFAULT 0,
  
  -- Performance metrics
  last_viewed_at TIMESTAMP,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_item_id (item_id),
  INDEX idx_view_count (view_count DESC),
  INDEX idx_favorite_count (favorite_count DESC)
);

-- Auto-created when item is created
-- Updated via triggers when:
-- - Item is viewed
-- - Item is favorited/unfavorited
-- - Offer is made on item
```

### 6. Categories
Flat category structure (no subcategories needed).

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0, -- Renamed from display_order
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Example categories
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

### 7. Offers
Swap proposals between users. Supports any combination: 1-to-1, 1-to-many, many-to-1, many-to-many.

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Users
  sender_id UUID NOT NULL REFERENCES users(id),   -- User making the offer
  receiver_id UUID NOT NULL REFERENCES users(id), -- User receiving the offer
  
  -- Offer message
  message TEXT,
  
  -- Financial terms
  top_up_amount DECIMAL(10, 2) DEFAULT 0, -- Money to add/request for swap
  -- Positive: sender offers to add money
  -- Negative: sender requests money from receiver
  -- Zero: even value swap (no money involved)
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', 
  -- pending: waiting for response
  -- accepted: receiver accepted, swap in progress
  -- completed: swap completed successfully
  -- declined: receiver declined
  -- cancelled: sender cancelled
  -- expired: offer expired (optional feature)
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When status last changed
  expires_at TIMESTAMP, -- Auto-expire after X days (optional)
  
  -- Parent offer (for counter offers - future feature)
  parent_offer_id UUID REFERENCES offers(id),
  
  -- Indexes
  INDEX idx_sender (sender_id),
  INDEX idx_receiver (receiver_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Note: 
-- 1. Removed target_item_id (supports multiple items on both sides)
-- 2. Removed suggested_meeting_place (external communication in MVP)
-- 3. Removed accepted_at, completed_at (use status_updated_at instead)
-- 4. Items on both sides tracked in offer_items table
```

### 8. Offer Items
Items in the offer from BOTH sides (sender's items + receiver's items).

```sql
CREATE TABLE offer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id),
  
  -- Which side of the offer
  side VARCHAR(20) NOT NULL, 
  -- 'offered': items sender is offering (their items)
  -- 'requested': items sender wants (receiver's items)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_offer_id (offer_id),
  INDEX idx_side (side),
  UNIQUE(offer_id, item_id, side)
);

-- Example offer scenarios:
-- 
-- 1-to-1 swap: User A's camera for User B's lens
--   offer_items: (item_id=camera, side='offered'), (item_id=lens, side='requested')
--
-- 1-to-many: User A's camera for User B's lens + tripod
--   offer_items: (item_id=camera, side='offered'), (item_id=lens, side='requested'), (item_id=tripod, side='requested')
--
-- many-to-1: User A's camera + bag for User B's lens
--   offer_items: (item_id=camera, side='offered'), (item_id=bag, side='offered'), (item_id=lens, side='requested')
--
-- many-to-many: User A's camera + bag for User B's lens + tripod + filter
--   Multiple items on both sides
```

### 9. User Contact Preferences
User's preferred contact methods (shown after offer acceptance).

```sql
CREATE TABLE user_contact_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Contact methods (user chooses what to share)
  show_phone BOOLEAN DEFAULT FALSE,
  show_email BOOLEAN DEFAULT FALSE,
  phone_number VARCHAR(20),
  preferred_method VARCHAR(50), -- phone, email, whatsapp, telegram
  whatsapp_number VARCHAR(20),
  other_contact_info TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);
```

### 10. Conversations (Post-MVP - Chat Feature)
**Note:** This table is for future in-app messaging feature, not in MVP.

```sql
-- Will be implemented post-MVP
-- CREATE TABLE conversations (...)
-- CREATE TABLE messages (...)
```

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Users
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  
  -- Related offer (must be completed)
  offer_id UUID NOT NULL REFERENCES offers(id),
  
  -- Review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Categories
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  item_accuracy_rating INTEGER CHECK (item_accuracy_rating >= 1 AND item_accuracy_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  
  -- Response
  response_text TEXT,
  response_at TIMESTAMP,
  
  -- Status
  is_visible BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_reviewee (reviewee_id),
  INDEX idx_created_at (created_at),
  UNIQUE(reviewer_id, reviewee_id, offer_id)
);
```

### 11. Reviews
User ratings and reviews after swaps.

**Note:** No separate swaps table needed! Reviews link directly to offers with status='completed'.

### 12. Favorites
Saved/favorited items.

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_item_id (item_id),
  UNIQUE(user_id, item_id)
);
```

### 13. Notifications
User notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification details
  type VARCHAR(50) NOT NULL, 
  -- offer_received, offer_accepted, message, match_found, etc.
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  
  -- Related entities
  related_user_id UUID REFERENCES users(id),
  related_item_id UUID REFERENCES items(id),
  related_offer_id UUID REFERENCES offers(id),
  
  -- Navigation
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);
```

### 14. Reports
User and item reports.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  
  -- What's being reported
  reported_user_id UUID REFERENCES users(id),
  reported_item_id UUID REFERENCES items(id),
  reported_message_id UUID REFERENCES messages(id),
  
  -- Report details
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  resolution_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_reporter (reporter_id),
  INDEX idx_reported_user (reported_user_id),
  INDEX idx_status (status)
);
```

### 15. User Blocks
Blocked users.

```sql
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_blocker (blocker_id),
  UNIQUE(blocker_id, blocked_id)
);
```

### 16. User Follows
Following other users.

```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_follower (follower_id),
  INDEX idx_following (following_id),
  UNIQUE(follower_id, following_id)
);
```

### 17. User Stats
Denormalized user statistics for performance (updated via triggers).

```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Swap Statistics
  total_swaps INTEGER DEFAULT 0, -- Count of completed swaps (both parties confirmed)
  successful_swaps INTEGER DEFAULT 0, -- Same as total_swaps (kept for future use if needed)
  cancelled_swaps INTEGER DEFAULT 0,
  
  -- Item Statistics
  items_listed INTEGER DEFAULT 0,
  items_swapped INTEGER DEFAULT 0,
  items_active INTEGER DEFAULT 0,
  
  -- Offer Statistics
  offers_sent INTEGER DEFAULT 0,
  offers_received INTEGER DEFAULT 0,
  offers_accepted INTEGER DEFAULT 0,
  offers_declined INTEGER DEFAULT 0,
  
  -- Engagement
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Performance Metrics
  average_response_time INTEGER, -- in minutes
  response_rate DECIMAL(5, 2) DEFAULT 0, -- percentage
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);

-- Note on calculations:
-- total_swaps: Incremented when offer status changes to 'completed'
-- successful_swaps: Currently same as total_swaps, can be used for quality metric later
-- These are updated via database triggers when offer status changes to 'completed'
```

### 18. User Ratings
Separate table for ratings (instead of denormalized in users table).

```sql
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Rating aggregates
  rating_average DECIMAL(3, 2) DEFAULT 0, -- Average rating (0-5)
  rating_count INTEGER DEFAULT 0, -- Total number of ratings received
  
  -- Rating breakdown
  rating_5_star INTEGER DEFAULT 0,
  rating_4_star INTEGER DEFAULT 0,
  rating_3_star INTEGER DEFAULT 0,
  rating_2_star INTEGER DEFAULT 0,
  rating_1_star INTEGER DEFAULT 0,
  
  -- Category ratings (optional detailed metrics)
  communication_average DECIMAL(3, 2) DEFAULT 0,
  item_accuracy_average DECIMAL(3, 2) DEFAULT 0,
  punctuality_average DECIMAL(3, 2) DEFAULT 0,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_rating_average (rating_average DESC)
);

-- Updated via trigger when new review is added
```

### 19. Activity Log
User activity tracking.

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  activity_type VARCHAR(100) NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
);
```

