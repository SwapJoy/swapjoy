import { supabase } from '../lib/supabase';

export class RedisCache {
  private static readonly CACHE_PREFIX = 'swapjoy:';
  private static readonly DEFAULT_TTL = 300; // 5 minutes

  // Generate cache key
  private static getCacheKey(prefix: string, ...params: any[]): string {
    const key = params.map(p => typeof p === 'object' ? JSON.stringify(p) : String(p)).join(':');
    return `${this.CACHE_PREFIX}${prefix}:${key}`;
  }

  // Get cached data
  static async get<T>(prefix: string, ...params: any[]): Promise<T | null> {
    try {
      const key = this.getCacheKey(prefix, ...params);
      
      // Try to use Edge Function first
      const { data, error } = await supabase.functions.invoke('redis-get', {
        body: { key }
      });

      if (error) {
        console.warn('Redis get error (Edge Function not available):', error);
        return null;
      }

      return data?.value || null;
    } catch (error) {
      console.warn('Redis get failed (Edge Function not deployed):', error);
      return null;
    }
  }

  // Set cached data
  static async set<T>(
    prefix: string, 
    value: T, 
    ttl: number = this.DEFAULT_TTL,
    ...params: any[]
  ): Promise<boolean> {
    try {
      const key = this.getCacheKey(prefix, ...params);
      const { error } = await supabase.functions.invoke('redis-set', {
        body: { key, value, ttl }
      });

      if (error) {
        console.warn('Redis set error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Redis set failed:', error);
      return false;
    }
  }

  // Delete cached data
  static async delete(prefix: string, ...params: any[]): Promise<boolean> {
    try {
      const key = this.getCacheKey(prefix, ...params);
      const { error } = await supabase.functions.invoke('redis-delete', {
        body: { key }
      });

      if (error) {
        console.warn('Redis delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Redis delete failed:', error);
      return false;
    }
  }

  // Cache with automatic key generation
  static async cache<T>(
    prefix: string,
    keyParams: any[],
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL,
    bypassCache: boolean = false
  ): Promise<T> {
    // Try to get from cache first (unless bypassed)
    if (!bypassCache) {
      const cached = await this.get<T>(prefix, ...keyParams);
      if (cached !== null) {
        console.log(`Cache hit for ${prefix}:`, keyParams);
        return cached;
      }
    }

    // Cache miss or bypassed, fetch data
    console.log(`Cache miss for ${prefix}:`, keyParams);
    const data = await fetchFn();
    
    // Try to store in cache (will fail silently if Edge Functions not deployed)
    try {
      await this.set(prefix, data, ttl, ...keyParams);
    } catch (error) {
      console.warn('Cache set failed (Edge Functions not deployed), continuing without cache:', error);
    }
    
    return data;
  }

  // Invalidate cache patterns
  static async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('redis-invalidate-pattern', {
        body: { pattern: `${this.CACHE_PREFIX}${pattern}` }
      });

      if (error) {
        console.warn('Redis invalidate pattern error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Redis invalidate pattern failed:', error);
      return false;
    }
  }
}
