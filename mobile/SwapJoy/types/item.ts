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

export interface ImageAnalysisResult {
  imageUrl: string;
  imageId?: string;
  detectedObjects: string[];
  suggestedCategory: {
    id: string;
    name: string;
    confidence: number;
  } | null;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedCondition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null;
  confidence: number;
}

export interface ImageAnalysisResponse {
  results: ImageAnalysisResult[];
  aggregated: {
    detectedObjects: string[];
    suggestedCategory: {
      id: string;
      name: string;
      confidence: number;
    } | null;
    suggestedTitle: string;
    suggestedDescription: string;
    suggestedCondition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null;
  };
}

export interface ItemDraft {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  condition: ItemCondition | null;
  price: string;
  currency: string;
  location_lat: number | null;
  location_lng: number | null;
  location_label?: string | null;
  images: DraftImage[];
  imageAnalysis?: ImageAnalysisResponse; // Store analysis results
  aiPrefilled?: boolean; // Flag to indicate AI suggestions
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  title_en?: string | null;
  title_ka?: string | null;
  slug: string;
  description: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number | null;
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
  meta?: {
    detectedObjects?: string[];
    suggestedCategory?: {
      id: string;
      name: string;
      confidence: number;
    } | null;
    suggestedTitle?: string;
    suggestedDescription?: string;
    confidence?: number;
    analyzedAt?: string;
  } | null;
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

