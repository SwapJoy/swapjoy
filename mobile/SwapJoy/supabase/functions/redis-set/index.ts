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
    const { key, value, ttlSeconds } = await req.json();
    if (!key || value === undefined) {
      return new Response(JSON.stringify({ error: 'Key and value are required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Use the correct Upstash Redis library
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }

    return new Response(JSON.stringify({ success: true, key }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Redis SET error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});