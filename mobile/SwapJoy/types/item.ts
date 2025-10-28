// Item and Draft Types

export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface DraftImage {
  id: string;
  uri: string;
  uploaded: boolean;
  supabaseUrl?: string;
  uploadProgress?: number;
  uploadError?: string;
}

export interface ItemDraft {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  condition: ItemCondition | null;
  price: string;
  currency: string;
  images: DraftImage[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Item {
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
}

export interface ItemImage {
  id: string;
  item_id: string;
  image_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface CreateItemInput {
  title: string;
  description: string;
  category_id: string | null;
  condition: ItemCondition;
  price: number;
  currency: string;
  location_lat?: number | null;
  location_lng?: number | null;
}

export interface CreateItemImageInput {
  item_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
}

