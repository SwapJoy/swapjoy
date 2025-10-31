# Data Access and Service Methods

This app uses Supabase client queries (tables, RPC) wrapped by service methods instead of a traditional REST API. Below are the key service methods and sources.

### POST /auth/login
Login with phone number and password.

**Request:**
```json
{
  "phone": "+1234567890",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

### POST /auth/otp/send
Send OTP to phone number.

**Request:**
```json
{
  "phone": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent to phone number"
}
```

### POST /auth/otp/verify
Verify OTP and sign in.

**Request:**
```json
{
  "phone": "+1234567890",
  "token": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "username": "john_doe"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

### POST /auth/logout
Logout and invalidate tokens.

### POST /auth/forgot-password
Request password reset.

### POST /auth/reset-password
Reset password with token.

### POST /auth/verify-phone
Verify phone number (if needed).

---

## Users
- getProfile(): `users` (single row by current auth user id)
- updateProfile(): `users` update for profile fields

---

## Items
- getItems(): `items`
- getUserPublishedItems(userId): `items` + separate `item_images` fetch; choose primary > lowest `sort_order` > thumbnail
- getUserDraftItems(userId): same as above with status=draft
- createItem(), updateItem(), deleteItem(): writes on `items`

### PUT /users/me
Update current user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "city": "San Francisco"
}
```

### POST /users/me/avatar
Upload profile picture.

**Request:** `multipart/form-data`
- file: image file

### GET /users/:userId
Get public user profile.

### GET /users/:userId/items
Get user's items.

**Query Params:**
- status: available|swapped
- page: number
- limit: number

### GET /users/:userId/reviews
Get user reviews.

### POST /users/:userId/follow
Follow a user.

### DELETE /users/:userId/follow
Unfollow a user.

### POST /users/:userId/block
Block a user.

### DELETE /users/:userId/block
Unblock a user.

### PUT /users/me/location-preferences
Update location preferences.

**Request:**
```json
{
  "preferredRadiusKm": 75.50,
  "manualLocation": {
    "lat": 37.7849,
    "lng": -122.4094
  }
}
```

### GET /users/me/location-preferences
Get location preferences.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
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
}
```

---

## Offers
- getOffers(userId, type): `offers` + `offer_items` join
- createOffer(): inserts into `offers` and `offer_items`
- updateOfferStatus(): updates `offers.status`

**Query Params:**
- category: uuid
- condition: new|like_new|good|fair|poor
- lat: latitude
- lng: longitude
- radius: number (km)
- minValue: number
- maxValue: number
- search: string
- sort: newest|nearest|relevant
- page: number
- limit: number

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Vintage Camera",
      "description": "Great condition...",
      "category": {
        "id": "uuid",
        "name": "Electronics"
      },
      "condition": "good",
      "estimatedValue": 150,
      "currency": "USD",
      "images": [
        {
          "url": "https://...",
          "thumbnailUrl": "https://..."
        }
      ],
      "user": {
        "id": "uuid",
        "displayName": "John D.",
        "rating": 4.8
      },
      "distance": 2.5,
      "createdAt": "2024-01-20T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /items/:itemId
Get item details.

### POST /items
Create a new item.

**Request:**
```json
{
  "title": "Vintage Camera",
  "description": "Canon AE-1 from 1980...",
  "categoryId": "uuid",
  "condition": "good",
  "estimatedValue": 150,
  "currency": "USD",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  }
}
```

**Response:** `201 Created`

### PUT /items/:itemId
Update an item.

### DELETE /items/:itemId
Delete an item.

### POST /items/:itemId/images
Upload item images.

**Request:** `multipart/form-data`
- files: array of images (max 10)

### DELETE /items/:itemId/images/:imageId
Delete an item image.

### GET /items/:itemId/similar
Get similar items.

---

## Favorites and Notifications
- getFavorites(), addToFavorites(), removeFromFavorites(): `favorites`
- getNotifications(), markNotificationAsRead(): `notifications`

**Query Params:**
- type: sent|received
- status: pending|accepted|declined|completed
- page: number
- limit: number

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sender": {
        "id": "uuid",
        "displayName": "John D.",
        "rating": 4.8
      },
      "receiver": {
        "id": "uuid",
        "displayName": "Jane S.",
        "rating": 4.9
      },
      "targetItem": {
        "id": "uuid",
        "title": "Vintage Camera",
        "images": [...]
      },
      "offeredItems": [
        {
          "id": "uuid",
          "title": "Digital Camera",
          "images": [...]
        }
      ],
      "requestedItems": [
        {
          "id": "uuid",
          "title": "Vintage Camera",
          "images": [...]
        }
      ],
      "message": "Would love to swap!",
      "topUpAmount": 25.50,
      "status": "pending",
      "createdAt": "2024-01-21T10:00:00Z"
    }
  ]
}
```

### GET /offers/:offerId
Get offer details.

### POST /offers
Create a new offer.

**Request:**
```json
{
  "receiverId": "uuid",
  "offeredItemIds": ["uuid1", "uuid2"],
  "requestedItemIds": ["uuid3", "uuid4"],
  "message": "I'd love to swap for this!",
  "topUpAmount": 25.50
}
```

**Request Fields:**
- `receiverId`: User receiving the offer
- `offeredItemIds`: Items sender is offering (their items)
- `requestedItemIds`: Items sender wants (receiver's items)
- `message`: Optional message
- `topUpAmount`: Money to add/request (positive = sender adds money, negative = sender requests money, 0 = even swap)

**Response:** `201 Created`

### PUT /offers/:offerId/accept
Accept an offer.

### PUT /offers/:offerId/decline
Decline an offer.

**Request:**
```json
{
  "reason": "optional reason"
}
```

### POST /offers/:offerId/counter
Create a counter offer.

**Request:**
```json
{
  "offeredItemIds": ["uuid3", "uuid4"],
  "requestedItemIds": ["uuid5", "uuid6"],
  "message": "How about these instead?",
  "topUpAmount": -15.00
}
```

### DELETE /offers/:offerId
Cancel an offer.

---

## Aggregations and AI
- getTopPicksForUser(), getRecentlyListed(), getSimilarCostItems(), getSimilarCategoryItems(): combines Supabase and RPC

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "participant": {
        "id": "uuid",
        "displayName": "Jane S.",
        "profileImageUrl": "https://..."
      },
      "offer": {
        "id": "uuid"
      },
      "lastMessage": {
        "text": "Sounds good!",
        "sentAt": "2024-01-21T15:30:00Z",
        "senderId": "uuid"
      },
      "unreadCount": 2,
      "updatedAt": "2024-01-21T15:30:00Z"
    }
  ]
}
```

### GET /conversations/:conversationId
Get conversation details.

### GET /conversations/:conversationId/messages
Get messages in a conversation.

**Query Params:**
- page: number
- limit: number
- before: timestamp (for pagination)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "text": "Hi! Is this still available?",
      "type": "text",
      "isRead": true,
      "createdAt": "2024-01-21T14:00:00Z"
    }
  ]
}
```

### POST /conversations/:conversationId/messages
Send a message.

**Request:**
```json
{
  "text": "Yes, still available!",
  "type": "text"
}
```

### PUT /conversations/:conversationId/read
Mark conversation as read.

---

## Categories
- getCategories(): cached `all-categories` list in Redis
- getCategoryIdToNameMap(): convenience mapper for ID→name

### GET /search
Global search.

**Query Params:**
- q: search query
- type: items|users
- filters: category, condition, etc.

### GET /search/suggestions
Get search suggestions/autocomplete.

**Query Params:**
- q: partial query

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    "vintage camera",
    "vintage cameras canon",
    "camera lens"
  ]
}
```

---


## Caching (Redis)
- `all-categories` (active)
- `user-stats:<user_id>`
- `user-ratings:<user_id>`
- Recommendation-related keys (see code)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "slug": "electronics",
      "iconUrl": "https://...",
      "subcategories": [
        {
          "id": "uuid",
          "name": "Cameras",
          "slug": "cameras"
        }
      ]
    }
  ]
}
```

### GET /categories/:categoryId/items
Get items in a category.

---

## Notes
- See `mobile/SwapJoy/services/api.ts` for method-level query shapes and mapping decisions

### POST /favorites
Add item to favorites.

**Request:**
```json
{
  "itemId": "uuid"
}
```

### DELETE /favorites/:itemId
Remove from favorites.

---

## 9. Wishlist Endpoints

### GET /wishlists
Get user's wishlists.

### POST /wishlists
Create a wishlist.

**Request:**
```json
{
  "title": "Looking for Cameras",
  "description": "Vintage cameras",
  "categoryId": "uuid",
  "keywords": ["camera", "vintage", "canon"],
  "alertsEnabled": true,
  "maxDistance": 50
}
```

### PUT /wishlists/:wishlistId
Update wishlist.

### DELETE /wishlists/:wishlistId
Delete wishlist.

---

## 10. Review Endpoints

### GET /reviews
Get reviews for a user.

**Query Params:**
- userId: uuid
- page: number
- limit: number

### POST /reviews
Create a review.

**Request:**
```json
{
  "revieweeId": "uuid",
  "offerId": "uuid",
  "rating": 5,
  "reviewText": "Great swap!",
  "communicationRating": 5,
  "itemAccuracyRating": 5,
  "punctualityRating": 5
}
```

---

## 11. Notification Endpoints

### GET /notifications
Get user notifications.

**Query Params:**
- unreadOnly: boolean
- page: number
- limit: number

### PUT /notifications/:notificationId/read
Mark as read.

### PUT /notifications/read-all
Mark all as read.

### DELETE /notifications/:notificationId
Delete notification.

---

## 12. Report Endpoints

### POST /reports
Create a report.

**Request:**
```json
{
  "reportedUserId": "uuid",
  "reportedItemId": "uuid",
  "reason": "inappropriate_content",
  "description": "Details..."
}
```

---

## 13. Swap Endpoints

### POST /swaps
Create/schedule a swap.

**Request:**
```json
{
  "offerId": "uuid",
  "meetingLocation": {
    "lat": 37.7749,
    "lng": -122.4194,
    "name": "Central Park"
  },
  "scheduledAt": "2024-01-25T14:00:00Z"
}
```

### PUT /swaps/:swapId/confirm
Confirm swap completion.

### GET /swaps/history
Get swap history.

---

## 14. Analytics Endpoints

### GET /analytics/me
Get user analytics dashboard.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSwaps": 15,
    "successfulSwaps": 14,
    "totalValueExchanged": 2500,
    "itemsSaved": 30,
    "co2Saved": 150,
    "badges": [...]
  }
}
```

---

## Rate Limits

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 1000 requests/minute
- Upload endpoints: 10 requests/minute

## Pagination

Default pagination:
- page: 1
- limit: 20 (max 100)

## Versioning

API version is in the URL path: `/v1/...`

