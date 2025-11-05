import { supabase } from '../lib/supabase';

export class RedisCache {
  private static readonly CACHE_PREFIX = 'swapjoy:';
  private static readonly DEFAULT_TTL = 300; // 5 minutes in seconds
  private static readonly INVOKE_TIMEOUT_MS = 1500;

  private static async invokeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<{ timedOut: boolean; result?: T }> {
    let timedOut = false;
    const timeout = new Promise<undefined>((resolve) => setTimeout(() => {
      timedOut = true;
      resolve(undefined);
    }, timeoutMs));
    const result = await Promise.race([fn(), timeout]);
    if (timedOut) {
      return { timedOut: true };
    }
    return { timedOut: false, result: result as T };
  }

  // Generate cache key
  private static getCacheKey(prefix: string, ...params: any[]): string {
    const key = params.map(p => typeof p === 'object' ? JSON.stringify(p) : String(p)).join(':');
    return `${this.CACHE_PREFIX}${prefix}:${key}`;
  }

  // Get cached data
  static async get<T>(prefix: string, ...params: any[]): Promise<T | null> {
    try {
      const key = this.getCacheKey(prefix, ...params);
      // Try to use Edge Function first (with timeout)
      const res = await this.invokeWithTimeout(() => supabase.functions.invoke('redis-get', { body: { key } }), this.INVOKE_TIMEOUT_MS);
      if (res.timedOut) {
        console.warn('Redis get timed out, bypassing cache for key:', key);
        return null;
      }
      const { data, error } = (res.result as any) || {};

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
    ...params: any[]
  ): Promise<boolean> {
    try {
      const ttl: number = this.DEFAULT_TTL
      const key = this.getCacheKey(prefix, ...params);
      const res = await this.invokeWithTimeout(() => supabase.functions.invoke('redis-set', { body: { key, value, ttl, ttlSeconds: ttl } }), this.INVOKE_TIMEOUT_MS);
      if (res.timedOut) {
        console.warn('Redis set timed out, proceeding without cache for key:', key);
        return false;
      }
      const { error } = (res.result as any) || {};

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
      const res = await this.invokeWithTimeout(() => supabase.functions.invoke('redis-delete', { body: { key } }), this.INVOKE_TIMEOUT_MS);
      if (res.timedOut) {
        console.warn('Redis delete timed out for key:', key);
        return false;
      }
      const { error } = (res.result as any) || {};

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
      await this.set(prefix, data, ...keyParams);
    } catch (error) {
      console.warn('Cache set failed (Edge Functions not deployed), continuing without cache:', error);
    }
    
    return data;
  }

  // Invalidate cache patterns
  static async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      const res = await this.invokeWithTimeout(() => supabase.functions.invoke('redis-invalidate-pattern', { body: { pattern: `${this.CACHE_PREFIX}${pattern}` } }), this.INVOKE_TIMEOUT_MS);
      if (res.timedOut) {
        console.warn('Redis invalidate pattern timed out for pattern:', pattern);
        return false;
      }
      const { error } = (res.result as any) || {};

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
