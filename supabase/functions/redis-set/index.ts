import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { key, value, ttl } = await req.json()

    if (!key || value === undefined) {
      return new Response(JSON.stringify({ error: 'key and value are required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get Redis connection
    const redis = new Redis(Deno.env.get('REDIS_URL') || 'redis://localhost:6379')
    
    // Serialize value to JSON
    const serializedValue = JSON.stringify(value)
    
    // Set value in Redis
    const success = await redis.set(key, serializedValue, ttl)
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to set value in Redis' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Redis set error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Simple Redis client for Deno
class Redis {
  private url: string

  constructor(url: string) {
    this.url = url
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      const url = ttl 
        ? `${this.url}/setex/${encodeURIComponent(key)}/${ttl}`
        : `${this.url}/set/${encodeURIComponent(key)}`
      
      const response = await fetch(url, {
        method: 'POST',
        body: value,
        headers: { 'Content-Type': 'text/plain' }
      })
      
      return response.ok
    } catch (error) {
      console.error('Redis SET error:', error)
      return false
    }
  }
}
