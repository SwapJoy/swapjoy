import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocation from 'expo-location';
import * as ExpoLocalization from 'expo-localization';
import { ApiService } from '../services/api';
import { detectLocationFromIP } from '../services/ipGeolocationService';
import { getLocationFromRegion } from '../services/regionGeocodingService';

const LOCATION_STORAGE_KEY = '@swapjoy_last_location';
const MANUAL_LOCATION_STORAGE_KEY = '@swapjoy_manual_location';
const CITIES_STORAGE_KEY = '@swapjoy_cities_cache';
const CITIES_TIMESTAMP_KEY = '@swapjoy_cities_timestamp';
const LOCATION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface City {
  id: string;
  name: string;
  country: string;
  state_province?: string | null;
  center_lat: number;
  center_lng: number;
  timezone?: string | null;
  population?: number | null;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ManualLocation {
  lat: number;
  lng: number;
  cityId?: string;
  cityName?: string;
}

interface LocationContextType {
  // Current location
  currentLocation: LocationCoordinates | null;
  locationLoading: boolean;
  locationError: Error | null;
  
  // Manual location (selected city)
  manualLocation: ManualLocation | null;
  
  // Selected location (computed: manualLocation if set, otherwise currentLocation)
  selectedLocation: LocationCoordinates | ManualLocation | null;
  
  // Cities
  cities: City[];
  citiesLoading: boolean;
  citiesError: Error | null;
  filterCitiesByName: (query: string) => City[];
  
  // Methods
  refreshLocation: () => Promise<void>;
  refreshCities: () => Promise<void>;
  setManualLocation: (location: ManualLocation | null) => Promise<void>;
  clearManualLocation: () => Promise<void>;
  setCurrentLocationFromIP: () => Promise<void>;
  setCurrentLocationFromRegion: () => Promise<void>;
  ensureLocationDetected: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<Error | null>(null);
  
  const [manualLocation, setManualLocationState] = useState<ManualLocation | null>(null);
  
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<Error | null>(null);
  
  const isMountedRef = useRef(true);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);
  const permissionStatusRef = useRef<'granted' | 'denied' | 'undetermined' | null>(null);
  
  // Computed selectedLocation: manualLocation if set, otherwise currentLocation
  // Use useMemo to ensure it updates when dependencies change
  const selectedLocation: LocationCoordinates | ManualLocation | null = useMemo(() => {
    const result = manualLocation || currentLocation;
    console.log('[LocationContext] selectedLocation computed', {
      manualLocation,
      currentLocation,
      result,
    });
    return result;
  }, [manualLocation, currentLocation]);

  /**
   * Load last location from AsyncStorage
   */
  const loadCachedLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (!cachedData) {
        return null;
      }

      const parsed = JSON.parse(cachedData) as LocationCoordinates;
      const now = Date.now();
      const age = now - parsed.timestamp;

      // If location is older than refresh interval, still return it but mark for refresh
      if (age > LOCATION_REFRESH_INTERVAL) {
        console.log('[LocationContext] Cached location is stale, will refresh');
      }

      console.log('[LocationContext] Loaded location from cache:', parsed);
      return parsed;
    } catch (err) {
      console.error('[LocationContext] Error loading cached location:', err);
      return null;
    }
  }, []);

  /**
   * Save location to AsyncStorage
   */
  const saveLocation = useCallback(async (location: LocationCoordinates): Promise<void> => {
    try {
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      console.log('[LocationContext] Saved location to cache');
    } catch (err) {
      console.error('[LocationContext] Error saving location:', err);
    }
  }, []);

  /**
   * Load manual location from AsyncStorage
   */
  const loadCachedManualLocation = useCallback(async (): Promise<ManualLocation | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(MANUAL_LOCATION_STORAGE_KEY);
      if (!cachedData) {
        return null;
      }
      const parsed = JSON.parse(cachedData) as ManualLocation;
      console.log('[LocationContext] Loaded manual location from cache:', parsed);
      return parsed;
    } catch (err) {
      console.error('[LocationContext] Error loading cached manual location:', err);
      return null;
    }
  }, []);

  /**
   * Save manual location to AsyncStorage
   */
  const saveManualLocation = useCallback(async (location: ManualLocation | null): Promise<void> => {
    try {
      if (location) {
        await AsyncStorage.setItem(MANUAL_LOCATION_STORAGE_KEY, JSON.stringify(location));
        console.log('[LocationContext] Saved manual location to cache');
      } else {
        await AsyncStorage.removeItem(MANUAL_LOCATION_STORAGE_KEY);
        console.log('[LocationContext] Cleared manual location from cache');
      }
    } catch (err) {
      console.error('[LocationContext] Error saving manual location:', err);
    }
  }, []);

  /**
   * Set manual location (selected city coordinates)
   */
  const setManualLocation = useCallback(async (location: ManualLocation | null): Promise<void> => {
    console.log('[LocationContext] setManualLocation CALLED', {
      location,
      isMounted: isMountedRef.current,
      locationType: typeof location,
      hasLat: location ? 'lat' in location : false,
      hasLng: location ? 'lng' in location : false,
    });
    
    if (!isMountedRef.current) {
      console.log('[LocationContext] setManualLocation SKIPPED - not mounted');
      return;
    }
    
    // Update state first for immediate UI update - this is synchronous
    console.log('[LocationContext] Calling setManualLocationState with:', JSON.stringify(location));
    setManualLocationState(location);
    console.log('[LocationContext] setManualLocationState called - state should update on next render');
    
    // Then save to storage (async, non-blocking)
    saveManualLocation(location).catch(err => {
      console.error('[LocationContext] Error saving manual location to storage:', err);
    });
  }, [saveManualLocation]);

  /**
   * Clear manual location (use current location instead)
   */
  const clearManualLocation = useCallback(async (): Promise<void> => {
    await setManualLocation(null);
  }, [setManualLocation]);

  /**
   * Get current location from device
   * Requests permissions if not already granted
   */
  const refreshLocation = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    try {
      setLocationLoading(true);
      setLocationError(null);

      // Check permission status first
      let { status } = await ExpoLocation.getForegroundPermissionsAsync();
      permissionStatusRef.current = status;

      // Request permissions if not granted
      if (status !== 'granted') {
        const requestResult = await ExpoLocation.requestForegroundPermissionsAsync();
        status = requestResult.status;
        permissionStatusRef.current = status;
      }

      if (status !== 'granted') {
        const error = new Error('Location permission not granted');
        if (isMountedRef.current) {
          setLocationError(error);
          setLocationLoading(false);
        }
        return;
      }

      // Get current position
      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const location: LocationCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now(),
      };

      // Save to cache
      await saveLocation(location);

      if (isMountedRef.current) {
        setCurrentLocation(location);
        setLocationError(null);
        console.log('[LocationContext] Location refreshed:', location);
      }
    } catch (err: any) {
      console.error('[LocationContext] Error refreshing location:', err);
      if (isMountedRef.current) {
        setLocationError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setLocationLoading(false);
      }
    }
  }, [saveLocation]);

  /**
   * Set current location from IP geolocation (no permissions required)
   * This is used as a fallback when GPS location is not available
   */
  const setCurrentLocationFromIP = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    try {
      setLocationLoading(true);
      setLocationError(null);

      console.log('[LocationContext] Detecting location from IP address...');
      const ipLocation = await detectLocationFromIP();

      if (!ipLocation) {
        const error = new Error('Failed to detect location from IP address');
        if (isMountedRef.current) {
          setLocationError(error);
          setLocationLoading(false);
        }
        return;
      }

      const location: LocationCoordinates = {
        lat: ipLocation.lat,
        lng: ipLocation.lng,
        timestamp: Date.now(),
      };

      // Save to cache
      await saveLocation(location);

      if (isMountedRef.current) {
        setCurrentLocation(location);
        setLocationError(null);
        console.log('[LocationContext] Location set from IP:', location);
      }
    } catch (err: any) {
      console.error('[LocationContext] Error setting location from IP:', err);
      if (isMountedRef.current) {
        setLocationError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setLocationLoading(false);
      }
    }
  }, [saveLocation]);

  /**
   * Get device country code from locale
   */
  const getDeviceCountryCode = useCallback((): string | null => {
    try {
      const locales = ExpoLocalization.getLocales?.() ?? [];
      
      // Try to get country code from locale objects (iOS: regionCode, Android: countryCode)
      for (const locale of locales) {
        // @ts-ignore - regionCode and countryCode may exist but not in types
        const regionCode = locale.regionCode || locale.countryCode;
        if (regionCode && regionCode.length === 2) {
          return regionCode.toUpperCase();
        }

        // Fallback: Extract from languageTag if available (e.g., "en-US" -> "US")
        const languageTag = locale.languageTag || '';
        const parts = languageTag.split('-');
        if (parts.length >= 2) {
          const countryPart = parts[parts.length - 1];
          if (countryPart && countryPart.length === 2) {
            return countryPart.toUpperCase();
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('[LocationContext] Error getting device country code:', error);
      return null;
    }
  }, []);

  /**
   * Set current location from device region/locale (fallback when GPS and IP fail)
   * Uses country code from device locale to get approximate country coordinates
   */
  const setCurrentLocationFromRegion = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    try {
      setLocationLoading(true);
      setLocationError(null);

      const countryCode = getDeviceCountryCode();
      if (!countryCode) {
        const error = new Error('Could not determine device country code');
        if (isMountedRef.current) {
          setLocationError(error);
          setLocationLoading(false);
        }
        return;
      }

      console.log('[LocationContext] Detecting location from device region:', countryCode);
      const regionLocation = await getLocationFromRegion(countryCode);

      if (!regionLocation) {
        const error = new Error('Failed to get location from device region');
        if (isMountedRef.current) {
          setLocationError(error);
          setLocationLoading(false);
        }
        return;
      }

      const location: LocationCoordinates = {
        lat: regionLocation.lat,
        lng: regionLocation.lng,
        timestamp: Date.now(),
      };

      // Save to cache
      await saveLocation(location);

      if (isMountedRef.current) {
        setCurrentLocation(location);
        setLocationError(null);
        console.log('[LocationContext] Location set from region:', location);
      }
    } catch (err: any) {
      console.error('[LocationContext] Error setting location from region:', err);
      if (isMountedRef.current) {
        setLocationError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setLocationLoading(false);
      }
    }
  }, [saveLocation, getDeviceCountryCode]);

  /**
   * Ensure location is detected using fallback chain: GPS > IP > Region
   * Only tries each method if previous ones fail or are unavailable
   */
  const ensureLocationDetected = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    // If we already have a location, don't do anything
    if (currentLocation) {
      console.log('[LocationContext] Location already detected, skipping ensureLocationDetected');
      return;
    }

    try {
      setLocationLoading(true);
      setLocationError(null);

      // Priority 1: Try GPS location (if permissions granted)
      // Check permission status first without requesting
      try {
        const { status } = await ExpoLocation.getForegroundPermissionsAsync();
        permissionStatusRef.current = status;

        if (status === 'granted') {
          console.log('[LocationContext] Permissions granted, trying GPS location...');
          // Try to get current position without requesting permissions
          try {
            const position = await ExpoLocation.getCurrentPositionAsync({
              accuracy: ExpoLocation.Accuracy.Balanced,
            });

            const location: LocationCoordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: Date.now(),
            };

            await saveLocation(location);

            if (isMountedRef.current) {
              setCurrentLocation(location);
              setLocationError(null);
              setLocationLoading(false);
              console.log('[LocationContext] Location detected via GPS:', location);
              return;
            }
          } catch (gpsError) {
            console.log('[LocationContext] GPS location failed, trying IP geolocation...', gpsError);
            // Continue to IP fallback
          }
        } else {
          console.log('[LocationContext] Location permissions not granted, skipping GPS');
        }
      } catch (permError) {
        console.warn('[LocationContext] Error checking permissions:', permError);
      }

      // Priority 2: Try IP geolocation
      console.log('[LocationContext] Trying IP geolocation...');
      const ipLocation = await detectLocationFromIP();
      if (ipLocation) {
        const location: LocationCoordinates = {
          lat: ipLocation.lat,
          lng: ipLocation.lng,
          timestamp: Date.now(),
        };

        await saveLocation(location);

        if (isMountedRef.current) {
          setCurrentLocation(location);
          setLocationError(null);
          setLocationLoading(false);
          console.log('[LocationContext] Location detected via IP:', location);
          return;
        }
      }

      // Priority 3: Try region/locale fallback
      console.log('[LocationContext] Trying region/locale fallback...');
      const countryCode = getDeviceCountryCode();
      if (countryCode) {
        const regionLocation = await getLocationFromRegion(countryCode);
        if (regionLocation) {
          const location: LocationCoordinates = {
            lat: regionLocation.lat,
            lng: regionLocation.lng,
            timestamp: Date.now(),
          };

          await saveLocation(location);

          if (isMountedRef.current) {
            setCurrentLocation(location);
            setLocationError(null);
            setLocationLoading(false);
            console.log('[LocationContext] Location detected via region:', location);
            return;
          }
        }
      }

      // All methods failed
      console.warn('[LocationContext] All location detection methods failed');
      if (isMountedRef.current) {
        setLocationError(new Error('Could not determine location using any method'));
        setLocationLoading(false);
      }
    } catch (err: any) {
      console.error('[LocationContext] Error in ensureLocationDetected:', err);
      if (isMountedRef.current) {
        setLocationError(err instanceof Error ? err : new Error(String(err)));
        setLocationLoading(false);
      }
    }
  }, [currentLocation, saveLocation, getDeviceCountryCode]);

  /**
   * Load cities from AsyncStorage
   */
  const loadCachedCities = useCallback(async (): Promise<City[] | null> => {
    try {
      const [cachedData, timestampStr] = await Promise.all([
        AsyncStorage.getItem(CITIES_STORAGE_KEY),
        AsyncStorage.getItem(CITIES_TIMESTAMP_KEY),
      ]);

      if (!cachedData || !timestampStr) {
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp > CACHE_DURATION) {
        console.log('[LocationContext] Cities cache expired, will refresh');
        return null;
      }

      const parsed = JSON.parse(cachedData) as City[];
      console.log('[LocationContext] Loaded', parsed.length, 'cities from cache');
      return parsed;
    } catch (err) {
      console.error('[LocationContext] Error loading cached cities:', err);
      return null;
    }
  }, []);

  /**
   * Save cities to AsyncStorage
   */
  const saveCities = useCallback(async (citiesData: City[]): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.setItem(CITIES_STORAGE_KEY, JSON.stringify(citiesData)),
        AsyncStorage.setItem(CITIES_TIMESTAMP_KEY, Date.now().toString()),
      ]);
      console.log('[LocationContext] Saved', citiesData.length, 'cities to cache');
    } catch (err) {
      console.error('[LocationContext] Error saving cities:', err);
    }
  }, []);

  /**
   * Fetch cities from API
   */
  const refreshCities = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    try {
      setCitiesLoading(true);
      setCitiesError(null);

      const { data, error } = await ApiService.getActiveCities();

      if (error) {
        console.error('[LocationContext] Error fetching cities:', error);
        if (isMountedRef.current) {
          setCitiesError(error instanceof Error ? error : new Error(String(error)));
        }
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        // Save to cache
        await saveCities(data);

        if (isMountedRef.current) {
          setCities(data);
          console.log('[LocationContext] Cities refreshed:', data.length, 'cities');
        }
      }
    } catch (err: any) {
      console.error('[LocationContext] Error in refreshCities:', err);
      if (isMountedRef.current) {
        setCitiesError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setCitiesLoading(false);
      }
    }
  }, [saveCities]);

  /**
   * Filter cities by name (simple contains search, case-insensitive)
   */
  const filterCitiesByName = useCallback(
    (query: string): City[] => {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const lowerQuery = query.toLowerCase().trim();
      return cities.filter((city) => {
        const nameMatch = city.name.toLowerCase().includes(lowerQuery);
        const countryMatch = city.country.toLowerCase().includes(lowerQuery);
        const stateMatch = city.state_province?.toLowerCase().includes(lowerQuery);
        return nameMatch || countryMatch || stateMatch;
      });
    },
    [cities]
  );

  // Initialize location and cities on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initialize = async () => {
      // Load manual location from cache first
      const cachedManualLocation = await loadCachedManualLocation();
      if (cachedManualLocation && isMountedRef.current) {
        setManualLocationState(cachedManualLocation);
      }

      // Load location from cache first
      const cachedLocation = await loadCachedLocation();
      if (cachedLocation && isMountedRef.current) {
        setCurrentLocation(cachedLocation);
        setLocationLoading(false);
      } else {
        // Try to detect location using fallback chain: GPS > IP > Region
        await ensureLocationDetected();
      }

      // Load cities from cache first
      const cachedCities = await loadCachedCities();
      if (cachedCities && cachedCities.length > 0 && isMountedRef.current) {
        setCities(cachedCities);
        setCitiesLoading(false);
      }

      // Refresh cities in background
      refreshCities().catch((err) => {
        console.warn('[LocationContext] Background cities refresh failed:', err);
      });
    };

    initialize();
  }, [loadCachedLocation, loadCachedManualLocation, loadCachedCities, refreshLocation, refreshCities]);

  // Set up location refresh interval
  useEffect(() => {
    // Clear any existing interval
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }

    // Set up 5-minute refresh interval
    locationIntervalRef.current = setInterval(() => {
      refreshLocation().catch((err) => {
        console.warn('[LocationContext] Scheduled location refresh failed:', err);
      });
    }, LOCATION_REFRESH_INTERVAL);

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };
  }, [refreshLocation]);

  // Listen to AppState changes to refresh location on foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App moved to foreground
        console.log('[LocationContext] App moved to foreground, checking location refresh...');
        
        // Only refresh if permissions are already granted (don't prompt on foreground)
        try {
          const { status } = await ExpoLocation.getForegroundPermissionsAsync();
          permissionStatusRef.current = status;

          if (status === 'granted') {
            console.log('[LocationContext] Permissions granted, refreshing location on foreground...');
            // Refresh location silently (non-blocking)
            refreshLocation().catch((err) => {
              console.warn('[LocationContext] Foreground location refresh failed:', err);
            });
          } else {
            console.log('[LocationContext] Permissions not granted, skipping foreground refresh');
          }
        } catch (permError) {
          console.warn('[LocationContext] Error checking permissions on foreground:', permError);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [refreshLocation]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  // Create context value - using useMemo to ensure it updates when dependencies change
  const value: LocationContextType = useMemo(() => ({
    currentLocation,
    locationLoading,
    locationError,
    manualLocation,
    selectedLocation,
    cities,
    citiesLoading,
    citiesError,
    filterCitiesByName,
    refreshLocation,
    refreshCities,
    setManualLocation,
    clearManualLocation,
    setCurrentLocationFromIP,
    setCurrentLocationFromRegion,
    ensureLocationDetected,
  }), [
    currentLocation,
    locationLoading,
    locationError,
    manualLocation,
    selectedLocation,
    cities,
    citiesLoading,
    citiesError,
    filterCitiesByName,
    refreshLocation,
    refreshCities,
    setManualLocation,
    clearManualLocation,
    setCurrentLocationFromIP,
    setCurrentLocationFromRegion,
    ensureLocationDetected,
  ]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
