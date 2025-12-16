// Unified ListingItem type representing Item with denormalized data
// This type is used everywhere items are displayed: sections, search, etc.

import { ItemCondition } from './item';

export interface ListingItemImage {
  url: string;
  order: number;
}

export interface ListingItemCategory {
  title_en: string;
  title_ka: string;
  icon: string;
  color: string;
  slug: string;
}

export interface ListingItemUser {
  username: string;
  profile_image_url: string | null;
  firstname: string;
  lastname: string;
}

export interface ListingItem {
  // Core item fields
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: string | null;
  condition: ItemCondition;
  price: number;
  currency: string;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
  updated_at: string;
  view_count?: number;
  
  // Denormalized fields
  images: ListingItemImage[];
  category: ListingItemCategory | null;
  user: ListingItemUser | null;
  
  // Optional computed fields
  distance_km?: number | null;
  similarity?: number | null;
  
  // Legacy compatibility fields (for backward compatibility during migration)
  // These may be present in API responses but should not be used in new code
  image_url?: string | null;
  category_name?: string | null;
  category_name_en?: string | null;
  category_name_ka?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_image_url?: string | null;
}

