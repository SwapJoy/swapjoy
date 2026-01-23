-- Fix vector to array casting issue in refresh_user_preference_embedding
-- pgvector doesn't support direct cast from vector to float8[], so we convert via text parsing

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
  v_emb_arr float8[];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'refresh_user_preference_embedding: auth.uid() is NULL';
  END IF;

  -- Initialize sum array
  v_sum := array_fill(0.0::float8, ARRAY[v_dim]);

  -- Aggregate embeddings with weights
  FOR rec IN
    SELECT
      i.embedding,
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
    IF rec.weight IS NULL OR rec.weight <= 0 OR rec.embedding IS NULL THEN
      CONTINUE;
    END IF;

    v_weight := rec.weight;
    v_total_weight := v_total_weight + v_weight;

    -- Convert vector to array by parsing its text representation
    -- Vector text format: [0.123,0.456,...] - remove brackets and split by comma
    -- Use array_agg to convert unnest result back to array with proper ordering
    v_emb_arr := (
      SELECT array_agg(val::float8 ORDER BY ordinality)
      FROM unnest(string_to_array(trim(both '[]' from rec.embedding::text), ',')) WITH ORDINALITY AS t(val, ordinality)
    );

    -- element-wise: v_sum[i] += weight * emb[i]
    v_sum := (
      SELECT ARRAY(
        SELECT v_sum[idx] + v_weight * v_emb_arr[idx]
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
