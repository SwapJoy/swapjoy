# View Tracking Migration Instructions

## Quick Fix (Recommended)

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** the entire contents of `APPLY_VIEW_TRACKING_NOW.sql`
3. **Run the SQL script**
4. **Wait 1-2 minutes** for PostgREST schema cache to refresh

The script will create:
- `item_metrics` table
- `item_views` table  
- `fn_mostly_viewed()` function
- `fn_track_item_view()` function
- All necessary triggers, indexes, and RLS policies

## Alternative: Apply Migrations in Order

If you prefer to use the migration system:

1. Apply `20250128000000_create_item_view_tracking.sql`
2. Apply `20250128000001_add_view_count_to_section_functions.sql` (optional)
3. Apply `20250128000002_ensure_fn_mostly_viewed_exists.sql`

Then wait for PostgREST to refresh its schema cache.

## Verify It Works

After running the migration, test the function:

```sql
-- Test the function (replace with actual values)
SELECT * FROM fn_mostly_viewed(
  '00000000-0000-0000-0000-000000000000'::uuid,  -- p_user_id
  0.0,  -- p_user_lat
  0.0,  -- p_user_lng
  50,   -- p_radius_km
  10    -- p_limit
);
```

If you get results, the function is working!

## Troubleshooting

**If the error persists after 2-3 minutes:**
1. Go to Supabase Dashboard → Settings → General
2. Click "Restart Project" (this refreshes PostgREST schema cache)
3. Wait for restart to complete (~30 seconds)
4. Try again

**If you still get errors:**
- Check that the function exists: `SELECT * FROM pg_proc WHERE proname = 'fn_mostly_viewed';`
- Verify permissions: The function should be accessible to `authenticated` and `anon` roles





