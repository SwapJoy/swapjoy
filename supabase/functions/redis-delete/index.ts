import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { key } = await req.json()

    if (!key) {
      return new Response(JSON.stringify({ error: 'key is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get Redis connection
    const redis = new Redis(Deno.env.get('REDIS_URL') || 'redis://localhost:6379')
    
    // Delete value from Redis
    const success = await redis.del(key)
    
    if (!success) {
      return new Response(JSON.stringify({ error: 'Failed to delete value from Redis' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Redis delete error:', error)
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

  async del(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/del/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Redis DEL error:', error)
      return false
    }
  }
}
