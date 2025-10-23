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
    
    // Get value from Redis
    const value = await redis.get(key)
    
    if (value === null) {
      return new Response(JSON.stringify({ value: null }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Parse JSON value
    const parsedValue = JSON.parse(value)
    
    return new Response(JSON.stringify({ value: parsedValue }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Redis get error:', error)
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

  async get(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.url}/get/${encodeURIComponent(key)}`)
      if (response.status === 404) {
        return null
      }
      if (!response.ok) {
        throw new Error(`Redis GET failed: ${response.statusText}`)
      }
      return await response.text()
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
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
