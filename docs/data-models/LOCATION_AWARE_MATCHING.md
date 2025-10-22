# Location-Aware Matching

## 🎯 **Overview**

SwapJoy supports location-aware matching to help users find items within their preferred radius while maintaining semantic relevance.

---

## 📍 **Location Preferences**

### **User Location Settings**

Users can set their preferred search radius and location source:

```sql
-- Users table additions
preferred_radius_km DECIMAL(5, 2) DEFAULT 50.00, -- Search radius in kilometers
manual_location_lat DECIMAL(10, 8), -- User-selected location latitude
manual_location_lng DECIMAL(11, 8), -- User-selected location longitude
```

### **Location Logic**

```typescript
// Determine which location to use for matching
const getSearchLocation = (user: User) => {
  // If manual location is set, use it
  if (user.manual_location_lat && user.manual_location_lng) {
    return {
      lat: user.manual_location_lat,
      lng: user.manual_location_lng
    }
  }
  
  // Otherwise use current location
  return {
    lat: user.location_lat,
    lng: user.location_lng
  }
}
```

---

## 🎯 **Location-Aware Matching Algorithm**

### **Phase 1: MVP (Simple Location Filtering)**

```typescript
const findLocationAwareMatches = async (userItem: Item, user: User) => {
  // 1. Get user's preferred radius
  const maxDistance = user.preferred_radius_km || 50.00 // Default 50km
  
  // 2. Determine search location (current or manual)
  const searchLocation = getSearchLocation(user)
  
  // 3. Semantic search first
  const semanticMatches = await supabase.rpc('match_items', {
    query_embedding: userItem.embedding,
    match_threshold: 0.7,
    match_count: 100 // Get more results for location filtering
  })
  
  // 4. Filter by location within radius
  const locationFiltered = semanticMatches.data.filter(item => {
    const distance = calculateDistance(searchLocation, item.location)
    return distance <= maxDistance
  })
  
  // 5. Re-rank by combined score (semantic + location)
  return locationFiltered.map(item => ({
    ...item,
    distance: calculateDistance(searchLocation, item.location),
    combinedScore: item.similarity_score * 0.8 + (1 - (item.distance / maxDistance)) * 0.2
  })).sort((a, b) => b.combinedScore - a.combinedScore)
}
```

### **Distance Calculation**

```typescript
// Haversine formula for distance calculation
const calculateDistance = (loc1: Location, loc2: Location) => {
  const R = 6371 // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
```

---

## 📱 **UI/UX Implementation**

### **Location Settings Screen**

```
┌─────────────────────────────────────┐
│ Location Preferences                │
│                                     │
│ Search Radius:                      │
│ [50.00] km                          │
│ ○ 10 km    ● 50 km    ○ 100 km     │
│ ○ 25 km    ○ 200 km   ○ 500 km     │
│ ○ Any distance                      │
│                                     │
│ Location Source:                    │
│ ● Current location (GPS)            │
│ ○ Manual location                   │
│                                     │
│ [Save Preferences]                  │
└─────────────────────────────────────┘
```

### **Manual Location Selection**

```
┌─────────────────────────────────────┐
│ Select Your Location                │
│                                     │
│ Search: [San Francisco, CA    ]    │
│                                     │
│ Recent Locations:                   │
│ • San Francisco, CA                 │
│ • New York, NY                      │
│ • London, UK                        │
│                                     │
│ [Use Current Location]              │
└─────────────────────────────────────┘
```

### **Matching Results with Distance**

```
┌─────────────────────────────────────┐
│ Matches for your Camera (50km):     │
│                                     │
│ 1. Vintage Lens - 2.3 km away       │
│    95% match • Electronics          │
│                                     │
│ 2. Camera Bag - 5.1 km away         │
│    92% match • Accessories          │
│                                     │
│ 3. Tripod - 12.7 km away            │
│    88% match • Accessories          │
│                                     │
│ [Adjust radius: 25km] [100km]       │
└─────────────────────────────────────┘
```

---

## 🔧 **Implementation Details**

### **1. User Location Logic**

```typescript
// Determine which location to use for matching
const getSearchLocation = (user: User) => {
  // If manual location is set, use it
  if (user.manual_location_lat && user.manual_location_lng) {
    return {
      lat: user.manual_location_lat,
      lng: user.manual_location_lng
    }
  }
  
  // Otherwise use current location
  return {
    lat: user.location_lat,
    lng: user.location_lng
  }
}
```

### **2. Radius Validation**

```typescript
// Validate radius input
const validateRadius = (radius: number) => {
  if (radius < 0.1) return 0.1 // Minimum 100m
  if (radius > 1000) return 1000 // Maximum 1000km
  return Math.round(radius * 100) / 100 // Round to 2 decimal places
}
```

### **3. API Endpoints**

```typescript
// PUT /users/me/location-preferences
{
  "preferredRadiusKm": 75.50,
  "manualLocation": {
    "lat": 37.7849,
    "lng": -122.4094
  }
}

// GET /users/me/location-preferences
{
  "preferredRadiusKm": 50.00,
  "manualLocation": {
    "lat": 37.7849,
    "lng": -122.4094
  },
  "currentLocation": {
    "lat": 37.7749,
    "lng": -122.4194
  }
}
```

---

## 🎯 **Matching Strategy**

### **Combined Scoring**

```typescript
// Combined score calculation
const calculateCombinedScore = (item, user, maxDistance) => {
  const semanticScore = item.similarity_score // 0-1
  const locationScore = 1 - (item.distance / maxDistance) // 0-1
  
  // Weighted combination: 80% semantic, 20% location
  return semanticScore * 0.8 + locationScore * 0.2
}
```

### **Filtering Priority**

1. **Semantic relevance** (primary)
2. **Location within radius** (secondary)
3. **Combined score ranking** (final)

---

## 💡 **Key Benefits**

1. **✅ Local Relevance:** Find nearby items first
2. **✅ User Choice:** Customizable radius preferences
3. **✅ Better Matches:** Combined semantic + location scoring
4. **✅ Flexible Location:** Current or manual location selection
5. **✅ Performance:** Efficient filtering and ranking

---

## 🚀 **Implementation Phases**

### **Phase 1: MVP (Basic Location Filtering)**
- ✅ User radius preferences
- ✅ Location-based filtering
- ✅ Distance calculation
- ✅ Combined scoring

### **Phase 2: Enhanced (Location-Weighted Embeddings)**
- 🔄 Location-aware embedding generation
- 🔄 Advanced location preferences
- 🔄 Real-time location updates
- 🔄 Geofencing features

---

## 📋 **Database Schema Summary**

### **Users Table Changes:**
```sql
-- Add location preferences
ALTER TABLE users ADD COLUMN preferred_radius_km DECIMAL(5, 2) DEFAULT 50.00;
ALTER TABLE users ADD COLUMN manual_location_lat DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN manual_location_lng DECIMAL(11, 8);

-- Add indexes
CREATE INDEX idx_users_manual_location ON users(manual_location_lat, manual_location_lng);
```

The location-aware matching system is now ready for implementation! 🎉
