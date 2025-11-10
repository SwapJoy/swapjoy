export interface CityOption {
  id: string;
  name: string;
  country: string;
  state_province?: string | null;
  center_lat: number;
  center_lng: number;
  timezone?: string | null;
  population?: number | null;
}

export interface LocationSelection {
  lat: number;
  lng: number;
  cityName?: string | null;
  country?: string | null;
  cityId?: string | null;
  stateProvince?: string | null;
  source: 'city' | 'device';
  distanceKm?: number | null;
}

