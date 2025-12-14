-- ============================================================================
-- COMPLETE VIEW TRACKING SETUP - Run this in Supabase SQL Editor
-- ============================================================================
-- This script creates everything needed for view tracking
-- Run this if migrations haven't been applied yet
-- ============================================================================

SET search_path = public;

-- Ensure item_metrics table exists (if not already created)
CREATE TABLE IF NOT EXISTS item_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID UNIQUE NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0 NOT NULL,
  unique_view_count INTEGER DEFAULT 0 NOT NULL,
  last_viewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT item_metrics_view_count_non_negative CHECK (view_count >= 0),
  CONSTRAINT item_metrics_unique_view_count_non_negative CHECK (unique_view_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_item_metrics_item_id ON item_metrics(item_id);
CREATE INDEX IF NOT EXISTS idx_item_metrics_view_count ON item_metrics(view_count DESC);

-- Create or replace the function
DROP FUNCTION IF EXISTS public.fn_mostly_viewed(uuid, numeric, numeric, numeric, int);

CREATE OR REPLACE FUNCTION public.fn_mostly_viewed(
  p_user_id    uuid,
  p_user_lat   numeric,
  p_user_lng   numeric,
  p_radius_km  numeric DEFAULT 50,
  p_limit      int     DEFAULT 10
)
RETURNS TABLE (
  id                uuid,
  title             varchar(200),
  description       text,
  price             numeric(10,2),
  currency          varchar(3),
  condition         varchar(50),
  status            varchar(50),
  location_lat      numeric(10,8),
  location_lng      numeric(11,8),
  created_at        timestamp without time zone,
  updated_at        timestamp without time zone,
  category_id       uuid,
  user_id           uuid,
  username          text,
  first_name        text,
  last_name         text,
  profile_image_url text,
  images            jsonb,
  distance_km        numeric(10,2),
  view_count         integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH items_with_distance AS (
    SELECT
      i.*,
      CAST(
        CASE 
          WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
           AND i.location_lat IS NOT NULL AND i.location_lng IS NOT NULL
          THEN (
            6371 * 2 * ASIN(
              SQRT(
                POWER(SIN(RADIANS(i.location_lat - p_user_lat) / 2), 2) +
                COS(RADIANS(p_user_lat)) *
                COS(RADIANS(i.location_lat)) *
                POWER(SIN(RADIANS(i.location_lng - p_user_lng) / 2), 2)
              )
            )
          )
          ELSE NULL
        END AS numeric(10,2)
      ) AS distance_km
    FROM items i
    WHERE i.status = 'available'
      AND i.user_id <> p_user_id
      AND i.location_lat IS NOT NULL
      AND i.location_lng IS NOT NULL
      AND (
        p_user_lat IS NULL OR p_user_lng IS NULL OR
        (
          i.location_lat BETWEEN (p_user_lat - (p_radius_km / 111))
                            AND (p_user_lat + (p_radius_km / 111))
          AND i.location_lng BETWEEN (p_user_lng - (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
                            AND (p_user_lng + (p_radius_km / (111 * COS(RADIANS(p_user_lat)))))
        )
      )
  ),
  images_agg AS (
    SELECT
      ii.item_id,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id',         ii.id,
            'url',        ii.image_url,
            'is_primary', ii.is_primary,
            'created_at', ii.created_at
          )
          ORDER BY ii.is_primary DESC NULLS LAST, ii.created_at ASC
        ) FILTER (WHERE ii.item_id IS NOT NULL),
        '[]'::jsonb
      ) AS images
    FROM item_images ii
    GROUP BY ii.item_id
  )
  SELECT
    iwd.id,
    iwd.title,
    iwd.description,
    iwd.price,
    iwd.currency,
    iwd.condition,
    iwd.status,
    iwd.location_lat,
    iwd.location_lng,
    iwd.created_at,
    iwd.updated_at,
    iwd.category_id,
    u.id,
    u.username::text,
    u.first_name::text,
    u.last_name::text,
    u.profile_image_url,
    ia.images,
    iwd.distance_km,
    COALESCE(im.view_count, 0)::integer AS view_count
  FROM items_with_distance iwd
  JOIN users u ON u.id = iwd.user_id
  LEFT JOIN images_agg ia ON ia.item_id = iwd.id
  LEFT JOIN item_metrics im ON im.item_id = iwd.id
  WHERE
    (iwd.distance_km IS NULL OR iwd.distance_km <= p_radius_km)
    AND COALESCE(im.view_count, 0) > 0
  ORDER BY
    COALESCE(im.view_count, 0) DESC,
    iwd.created_at DESC,
    iwd.distance_km NULLS LAST
  LIMIT p_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.fn_mostly_viewed(uuid, numeric, numeric, numeric, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_mostly_viewed(uuid, numeric, numeric, numeric, int) TO anon;
GRANT EXECUTE ON FUNCTION public.fn_mostly_viewed(uuid, numeric, numeric, numeric, int) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.fn_mostly_viewed IS 'Returns the most viewed items sorted by view count, filtered by location radius';

-- ============================================================================
-- Create item_views table (for unique view tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS item_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT item_views_item_user_unique UNIQUE (item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_item_views_item_id ON item_views(item_id);
CREATE INDEX IF NOT EXISTS idx_item_views_user_id ON item_views(user_id);
CREATE INDEX IF NOT EXISTS idx_item_views_viewed_at ON item_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_item_views_item_user ON item_views(item_id, user_id);

-- ============================================================================
-- Create trigger to auto-create item_metrics when item is created
-- ============================================================================

CREATE OR REPLACE FUNCTION create_item_metrics_on_item_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO item_metrics (item_id, view_count, unique_view_count)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (item_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_item_metrics_on_item_insert ON items;
CREATE TRIGGER trigger_create_item_metrics_on_item_insert
  AFTER INSERT ON items
  FOR EACH ROW
  EXECUTE FUNCTION create_item_metrics_on_item_insert();

-- ============================================================================
-- Create function to track item view
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_track_item_view(
  p_item_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_view_id UUID;
  v_view_age_days INTEGER;
BEGIN
  -- Skip if item doesn't exist or is not available
  IF NOT EXISTS (
    SELECT 1 FROM items WHERE id = p_item_id AND status = 'available'
  ) THEN
    RETURN;
  END IF;

  -- For authenticated users, check if they've viewed this item in the last 30 days
  IF p_user_id IS NOT NULL THEN
    SELECT id, EXTRACT(DAY FROM (CURRENT_TIMESTAMP - viewed_at))::INTEGER
    INTO v_existing_view_id, v_view_age_days
    FROM item_views
    WHERE item_id = p_item_id AND user_id = p_user_id
    LIMIT 1;

    -- If view exists and is less than 30 days old, don't count again
    IF v_existing_view_id IS NOT NULL AND v_view_age_days < 30 THEN
      RETURN;
    END IF;

    -- If view exists but is older than 30 days, delete old record
    IF v_existing_view_id IS NOT NULL THEN
      DELETE FROM item_views WHERE id = v_existing_view_id;
    END IF;

    -- Insert new view record
    INSERT INTO item_views (item_id, user_id, viewed_at)
    VALUES (p_item_id, p_user_id, CURRENT_TIMESTAMP)
    ON CONFLICT (item_id, user_id) DO UPDATE
      SET viewed_at = CURRENT_TIMESTAMP;
  ELSE
    -- For anonymous users, we still track but don't deduplicate
    INSERT INTO item_views (item_id, user_id, viewed_at)
    VALUES (p_item_id, NULL, CURRENT_TIMESTAMP)
    ON CONFLICT (item_id, user_id) DO NOTHING;
  END IF;

  -- Update item_metrics atomically
  INSERT INTO item_metrics (item_id, view_count, unique_view_count, last_viewed_at)
  VALUES (p_item_id, 1, CASE WHEN p_user_id IS NOT NULL THEN 1 ELSE 0 END, CURRENT_TIMESTAMP)
  ON CONFLICT (item_id) DO UPDATE
  SET
    view_count = item_metrics.view_count + 1,
    unique_view_count = CASE 
      WHEN p_user_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM item_views 
        WHERE item_id = p_item_id 
        AND user_id = p_user_id 
        AND id != COALESCE(v_existing_view_id, '00000000-0000-0000-0000-000000000000'::UUID)
      ) 
      THEN item_metrics.unique_view_count + 1 
      ELSE item_metrics.unique_view_count 
    END,
    last_viewed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_track_item_view(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fn_track_item_view(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION fn_track_item_view(UUID, UUID) TO service_role;

-- ============================================================================
-- Enable RLS on new tables
-- ============================================================================

ALTER TABLE item_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for item_metrics (read-only for everyone)
DROP POLICY IF EXISTS "item_metrics_readable_by_all" ON item_metrics;
CREATE POLICY "item_metrics_readable_by_all"
  ON item_metrics FOR SELECT
  USING (true);

-- RLS Policies for item_views (users can only see their own views)
DROP POLICY IF EXISTS "item_views_readable_by_owner" ON item_views;
CREATE POLICY "item_views_readable_by_owner"
  ON item_views FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow the tracking function to insert views
DROP POLICY IF EXISTS "item_views_insertable_by_function" ON item_views;
CREATE POLICY "item_views_insertable_by_function"
  ON item_views FOR INSERT
  WITH CHECK (true);

-- Allow the tracking function to update metrics
DROP POLICY IF EXISTS "item_metrics_updatable_by_function" ON item_metrics;
CREATE POLICY "item_metrics_updatable_by_function"
  ON item_metrics FOR UPDATE
  USING (true);

-- ============================================================================
-- Backfill item_metrics for existing items
-- ============================================================================

INSERT INTO item_metrics (item_id, view_count, unique_view_count)
SELECT id, 0, 0
FROM items
WHERE status = 'available'
  AND id NOT IN (SELECT item_id FROM item_metrics WHERE item_id IS NOT NULL)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================================================
-- Refresh PostgREST schema cache (if possible)
-- Note: This might not work in all Supabase setups, but worth trying
-- ============================================================================

NOTIFY pgrst, 'reload schema';

