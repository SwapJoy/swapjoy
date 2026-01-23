-- Ensure all items have geo coordinates populated
-- This backfills geo for any items that have location_lat/lng but missing geo

UPDATE public.items
SET geo = ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)::geography
WHERE location_lat IS NOT NULL
  AND location_lng IS NOT NULL
  AND geo IS NULL;

-- Verify the trigger exists and is working
DROP TRIGGER IF EXISTS items_geo_sync_trg ON public.items;

CREATE TRIGGER items_geo_sync_trg
BEFORE INSERT OR UPDATE OF location_lat, location_lng
ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.items_geo_sync();
