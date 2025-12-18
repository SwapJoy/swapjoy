/**
 * IP Geolocation Service
 * 
 * Detects approximate user location based on their IP address using ipapi.co.
 * This service does not require location permissions and provides city-level accuracy.
 * Uses HTTPS endpoint for better compatibility with React Native.
 */

export interface IPGeolocationResult {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

interface IPAPIResponse {
  ip?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  country_name?: string;
  error?: boolean;
  reason?: string;
}

// In-memory cache for the session (prevents multiple calls during the same app session)
let cachedResult: IPGeolocationResult | null = null;

/**
 * Detect user's approximate location from their IP address
 * @returns Location coordinates (lat, lng) or null if detection fails
 */
export const detectLocationFromIP = async (): Promise<IPGeolocationResult | null> => {
  // Return cached result if available (for this app session)
  if (cachedResult) {
    console.log('[IPGeolocation] Returning cached location:', cachedResult);
    return cachedResult;
  }

  try {
    console.log('[IPGeolocation] Detecting location from IP address using ipapi.co...');
    
    // Call ipapi.co HTTPS endpoint (no query param = uses current IP)
    // Free tier: up to 1000 requests/day, no API key required
    // Uses HTTPS so it works better with React Native
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('[IPGeolocation] HTTP error:', response.status, response.statusText);
      return null;
    }

    const data: IPAPIResponse = await response.json();

    // Check for API errors
    if (data.error) {
      console.warn('[IPGeolocation] API returned error:', data.reason);
      return null;
    }

    if (!data.latitude || !data.longitude) {
      console.warn('[IPGeolocation] Invalid response: missing latitude/longitude', data);
      return null;
    }

    const result: IPGeolocationResult = {
      lat: data.latitude,
      lng: data.longitude,
      city: data.city,
      country: data.country_name || data.country,
    };

    // Cache the result for this session
    cachedResult = result;
    console.log('[IPGeolocation] Location detected successfully:', result);
    console.log('[IPGeolocation] Latitude:', data.latitude, 'Longitude:', data.longitude);
    
    return result;
  } catch (error: any) {
    // Handle network errors gracefully
    const errorMessage = error?.message || 'Unknown error';
    const isNetworkError = errorMessage.includes('Network request failed') || 
                          errorMessage.includes('network') ||
                          error?.name === 'TypeError';
    
    if (isNetworkError) {
      console.warn('[IPGeolocation] Network request failed - this is non-critical. User can set location manually later.');
    } else {
      console.error('[IPGeolocation] Unexpected error detecting location:', error);
    }
    
    // Don't throw - gracefully return null so the app can continue
    // The app will work without IP-based location detection
    return null;
  }
};

/**
 * Clear the cached IP geolocation result
 * Useful for testing or forcing a fresh detection
 */
export const clearIPGeolocationCache = (): void => {
  cachedResult = null;
  console.log('[IPGeolocation] Cache cleared');
};



