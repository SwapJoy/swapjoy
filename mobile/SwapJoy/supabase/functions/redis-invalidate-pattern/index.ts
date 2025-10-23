import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Redis } from 'https://esm.sh/@upstash/redis@1.19.3';

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
});

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { pattern } = await req.json();
    if (!pattern) {
      return new Response(JSON.stringify({ error: 'Pattern is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Use the correct Upstash Redis library
    // Use SCAN to find keys matching the pattern and then delete them
    let cursor = '0';
    let keysToDelete: string[] = [];
    
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
      keysToDelete = keysToDelete.concat(keys);
      cursor = nextCursor;
    } while (cursor !== '0');

    // Delete all matching keys
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      pattern, 
      deletedKeysCount: keysToDelete.length 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Redis INVALIDATE PATTERN error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});