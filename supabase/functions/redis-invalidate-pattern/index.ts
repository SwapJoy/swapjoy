import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { pattern } = await req.json()

    if (!pattern) {
      return new Response(JSON.stringify({ error: 'pattern is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Get Redis connection
    const redis = new Redis(Deno.env.get('REDIS_URL') || 'redis://localhost:6379')
    
    // Get all keys matching the pattern
    const keys = await redis.keys(pattern)
    
    if (keys.length === 0) {
      return new Response(JSON.stringify({ success: true, deleted: 0 }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    // Delete all matching keys
    const deleted = await redis.delMultiple(keys)
    
    return new Response(JSON.stringify({ success: true, deleted }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Redis invalidate pattern error:', error)
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

  async keys(pattern: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.url}/keys/${encodeURIComponent(pattern)}`)
      if (!response.ok) {
        throw new Error(`Redis KEYS failed: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Redis KEYS error:', error)
      return []
    }
  }

  async delMultiple(keys: string[]): Promise<number> {
    try {
      const response = await fetch(`${this.url}/del`, {
        method: 'POST',
        body: JSON.stringify(keys),
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`Redis DEL multiple failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      return result.deleted || 0
    } catch (error) {
      console.error('Redis DEL multiple error:', error)
      return 0
    }
  }
}
