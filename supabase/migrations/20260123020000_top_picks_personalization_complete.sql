-- Complete Top Picks Personalization Implementation
-- Includes: geo column, item_events, preference_embedding, refresh function

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;

------------------------------------------------------------
-- 2. Geolocation support on items (geo point)
------------------------------------------------------------

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS geo geography(Point, 4326);

-- Backfill from existing lat/lng
UPDATE public.items
SET geo = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography
WHERE location_lat IS NOT NULL
  AND location_lng IS NOT NULL
  AND geo IS NULL;

-- Keep geo in sync
CREATE OR REPLACE FUNCTION public.items_geo_sync()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
    NEW.geo := ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326)::geography;
  ELSE
    NEW.geo := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS items_geo_sync_trg ON public.items;

CREATE TRIGGER items_geo_sync_trg
BEFORE INSERT OR UPDATE OF location_lat, location_lng
ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.items_geo_sync();

-- Index for fast radius queries
CREATE INDEX IF NOT EXISTS items_geo_gix
  ON public.items
  USING GIST (geo);

------------------------------------------------------------
-- 3. Event logging schema: item_events + enum + RLS
------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'item_event_type'
  ) THEN
    CREATE TYPE public.item_event_type AS ENUM (
      'impression',
      'view',
      'save',
      'message',
      'swap_request',
      'hide'
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.item_events (
  id          bigserial PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  item_id     uuid NOT NULL REFERENCES public.items (id) ON DELETE CASCADE,
  event_type  public.item_event_type NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  meta        jsonb
);

CREATE INDEX IF NOT EXISTS item_events_user_id_created_at_idx
  ON public.item_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS item_events_item_id_created_at_idx
  ON public.item_events (item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS item_events_event_type_created_at_idx
  ON public.item_events (event_type, created_at DESC);

ALTER TABLE public.item_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'item_events'
      AND policyname = 'item_events_insert_own'
  ) THEN
    CREATE POLICY item_events_insert_own
      ON public.item_events
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'item_events'
      AND policyname = 'item_events_select_own'
  ) THEN
    CREATE POLICY item_events_select_own
      ON public.item_events
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END;
$$;

------------------------------------------------------------
-- 4. User preference embedding columns
------------------------------------------------------------

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preference_embedding vector(1536),
  ADD COLUMN IF NOT EXISTS preference_updated_at timestamptz;

------------------------------------------------------------
-- 5. refresh_user_preference_embedding(user_id)
--    Weighted by event type + time decay
------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.refresh_user_preference_embedding(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id uuid := COALESCE(p_user_id, auth.uid());
  v_dim     int  := 1536;
  v_sum     float8[];
  v_total_weight float8 := 0;
  rec record;
  v_idx int;
  v_weight float8;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'refresh_user_preference_embedding: auth.uid() is NULL';
  END IF;

  -- Initialize sum array
  v_sum := array_fill(0.0::float8, ARRAY[v_dim]);

  -- Aggregate embeddings with weights
  FOR rec IN
    SELECT
      i.embedding::float8[] AS emb_arr,
      SUM(
        CASE e.event_type
          WHEN 'impression'    THEN 0.1
          WHEN 'view'          THEN 0.5
          WHEN 'save'          THEN 2.0
          WHEN 'message'       THEN 3.0
          WHEN 'swap_request'  THEN 4.0
          ELSE 0.0
        END
        * EXP(-EXTRACT(EPOCH FROM (now() - e.created_at)) / 3600.0 / 72.0) -- ~3 days half-life
      ) AS weight
    FROM public.item_events e
    JOIN public.items i ON i.id = e.item_id
    WHERE e.user_id = v_user_id
      AND e.created_at >= now() - interval '30 days'
      AND i.embedding IS NOT NULL
    GROUP BY i.id, i.embedding
  LOOP
    IF rec.weight IS NULL OR rec.weight <= 0 OR rec.emb_arr IS NULL THEN
      CONTINUE;
    END IF;

    v_weight := rec.weight;
    v_total_weight := v_total_weight + v_weight;

    -- element-wise: v_sum[i] += weight * emb[i]
    v_sum := (
      SELECT ARRAY(
        SELECT v_sum[idx] + v_weight * rec.emb_arr[idx]
        FROM generate_subscripts(v_sum, 1) AS idx
      )
    );
  END LOOP;

  IF v_total_weight > 0 THEN
    -- Normalize and cast back to vector(1536)
    UPDATE public.users u
    SET
      preference_embedding = (
        SELECT (ARRAY(
          SELECT (v_sum[idx] / v_total_weight)::float4
          FROM generate_subscripts(v_sum, 1) AS idx
        ))::vector(1536)
      ),
      preference_updated_at = now()
    WHERE u.id = v_user_id;
  ELSE
    UPDATE public.users u
    SET
      preference_embedding = NULL,
      preference_updated_at = now()
    WHERE u.id = v_user_id;
  END IF;
END;
$$;
