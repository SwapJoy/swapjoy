/**
 * Region Geocoding Service
 * 
 * Determines approximate location coordinates based on device region/country code.
 * Uses restcountries.com free API to get country capital or center coordinates.
 * This is a fallback when GPS and IP geolocation are not available.
 */

export interface RegionGeocodingResult {
  lat: number;
  lng: number;
  countryCode: string;
  countryName?: string;
}

interface RestCountriesResponse {
  name: {
    common: string;
  };
  capitalInfo?: {
    latlng?: [number, number];
  };
  latlng?: [number, number]; // Country center coordinates (fallback if capital not available)
}

/**
 * Get approximate location coordinates from country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'GE')
 * @returns Location coordinates (lat, lng) or null if detection fails
 */
export const getLocationFromRegion = async (countryCode: string): Promise<RegionGeocodingResult | null> => {
  if (!countryCode || countryCode.length !== 2) {
    console.warn('[RegionGeocoding] Invalid country code:', countryCode);
    return null;
  }

  try {
    console.log('[RegionGeocoding] Getting location from country code:', countryCode);
    
    // Use restcountries.com free API to get country data including coordinates
    // Endpoint: https://restcountries.com/v3.1/alpha/{code}
    // Returns capital coordinates (latlng) or country center coordinates
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode.toUpperCase()}?fields=name,capitalInfo,latlng`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('[RegionGeocoding] HTTP error:', response.status, response.statusText);
      return null;
    }

    const data: RestCountriesResponse = await response.json();

    // Try to get capital coordinates first, fallback to country center (latlng)
    const coordinates = data.capitalInfo?.latlng || data.latlng;

    if (!coordinates || coordinates.length !== 2) {
      console.warn('[RegionGeocoding] Invalid response: missing coordinates', data);
      return null;
    }

    const [lat, lng] = coordinates;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      console.warn('[RegionGeocoding] Invalid coordinates:', coordinates);
      return null;
    }

    const result: RegionGeocodingResult = {
      lat,
      lng,
      countryCode: countryCode.toUpperCase(),
      countryName: data.name?.common,
    };

    console.log('[RegionGeocoding] Location determined from region:', result);
    console.log('[RegionGeocoding] Latitude:', lat, 'Longitude:', lng);
    
    return result;
  } catch (error: any) {
    // Handle network errors gracefully
    const errorMessage = error?.message || 'Unknown error';
    const isNetworkError = errorMessage.includes('Network request failed') || 
                          errorMessage.includes('network') ||
                          error?.name === 'TypeError';
    
    if (isNetworkError) {
      console.warn('[RegionGeocoding] Network request failed - region geocoding unavailable');
    } else {
      console.error('[RegionGeocoding] Unexpected error getting location from region:', error);
    }
    
    // Don't throw - gracefully return null so the app can continue
    return null;
  }
};




