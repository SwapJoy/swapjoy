// Recommendation scoring weights configuration
export interface RecommendationWeights {
  // Category preference weight (0-1)
  // 0 = category doesn't matter at all
  // 1 = only show items from favorite categories
  category_score: number;
  
  // Price matching weight (0-1)
  // 0 = price doesn't matter
  // 1 = only show items with similar prices
  price_score: number;
  
  // Location latitude weight (0-1)
  // 0 = location doesn't matter
  // 1 = only show items from same location
  location_lat: number;
  
  // Location longitude weight (0-1)
  // 0 = location doesn't matter
  // 1 = only show items from same location
  location_lng: number;
  
  // Embedding/similarity base weight (always active, 0-1)
  // This is the base semantic similarity weight
  similarity_weight: number;
}

export const DEFAULT_RECOMMENDATION_WEIGHTS: RecommendationWeights = {
  category_score: 0.9,    // 80% weight on category matching
  price_score: 0.1,       // 60% weight on price matching
  location_lat: 0.1,      // 40% weight on location
  location_lng: 0.1,      // 40% weight on location
  similarity_weight: 0.0, // 100% weight on semantic similarity (base)
};

// Clamp value between 0 and 1
export function clampWeight(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// Calculate distance between two coordinates using Haversine formula (returns km)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return Infinity; // No location data
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate location match score (0-1) based on distance and max radius
export function calculateLocationScore(
  userLat: number | null,
  userLng: number | null,
  itemLat: number | null,
  itemLng: number | null,
  maxRadiusKm: number = 50
): number {
  if (!userLat || !userLng || !itemLat || !itemLng) {
    return 0.5; // Neutral score if location data missing
  }
  
  const distance = calculateDistance(userLat, userLng, itemLat, itemLng);
  
  if (distance <= maxRadiusKm) {
    // Score decreases linearly as distance increases
    return Math.max(0, 1 - distance / maxRadiusKm);
  }
  
  // Items outside radius get very low score
  return Math.max(0, 0.1 - (distance - maxRadiusKm) / (maxRadiusKm * 10));
}

// Calculate price match score (0-1) based on price similarity
export function calculatePriceScore(
  userPrice: number,
  itemPrice: number,
  tolerance: number = 0.3 // 30% tolerance by default
): number {
  if (!userPrice || !itemPrice || userPrice === 0) {
    return 0.5; // Neutral score if no price data
  }
  
  const priceDiff = Math.abs(itemPrice - userPrice);
  const toleranceAmount = userPrice * tolerance;
  
  if (priceDiff <= toleranceAmount) {
    // Score decreases linearly as price difference increases
    return Math.max(0, 1 - priceDiff / toleranceAmount);
  }
  
  // Items with very different prices get lower score
  const excessDiff = priceDiff - toleranceAmount;
  return Math.max(0, 0.2 - excessDiff / userPrice);
}

// Calculate category match score (0-1)
export function calculateCategoryScore(
  itemCategoryId: string | null,
  favoriteCategories: string[]
): number {
  if (!itemCategoryId || !Array.isArray(favoriteCategories) || favoriteCategories.length === 0) {
    return 0.5; // Neutral score if no category preference or item has no category
  }
  
  if (favoriteCategories.includes(itemCategoryId)) {
    return 1.0; // Perfect match
  }
  
  return 0.0; // Not in favorite categories
}

// Calculate weighted final score
export function calculateWeightedScore(
  similarity: number,
  categoryMatch: number,
  priceMatch: number,
  locationMatch: number,
  weights: RecommendationWeights
): number {
  // Normalize all scores to 0-1 range
  const normalizedSimilarity = clampWeight(similarity);
  const normalizedCategory = clampWeight(categoryMatch);
  const normalizedPrice = clampWeight(priceMatch);
  const normalizedLocation = clampWeight(locationMatch);
  
  // Calculate weighted components
  const similarityComponent = normalizedSimilarity * weights.similarity_weight;
  const categoryComponent = normalizedCategory * weights.category_score;
  const priceComponent = normalizedPrice * weights.price_score;
  const locationComponent = normalizedLocation * ((weights.location_lat + weights.location_lng) / 2);
  
  // Calculate total weight for normalization
  const totalWeight = weights.similarity_weight + weights.category_score + weights.price_score + 
                      ((weights.location_lat + weights.location_lng) / 2);
  
  // If total weight is 0, return 0
  if (totalWeight === 0) {
    return 0;
  }
  
  // Combine weighted scores
  const combinedScore = similarityComponent + categoryComponent + priceComponent + locationComponent;
  
  // Normalize by total weight to get final score between 0-1
  return clampWeight(combinedScore / totalWeight);
}

