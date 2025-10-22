# API Endpoints

## Base URL
```
Production: https://api.swapjoy.com/v1
Staging: https://api-staging.swapjoy.com/v1
Development: http://localhost:3000/v1
```

## Authentication
All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

## Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

---

## 1. Authentication Endpoints

### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### POST /auth/login
Login with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`

### POST /auth/oauth/google
Google OAuth login.

**Request:**
```json
{
  "idToken": "google_id_token"
}
```

### POST /auth/oauth/apple
Apple Sign In.

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

### POST /auth/verify-email
Verify email address.

---

## 2. User Endpoints

### GET /users/me
Get current user profile.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John D.",
    "bio": "Love swapping!",
    "profileImageUrl": "https://...",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "stats": {
      "totalSwaps": 15,
      "rating": 4.8,
      "ratingCount": 12
    },
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

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

---

## 3. Item Endpoints

### GET /items
Get items with filters.

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
  "subcategoryId": "uuid",
  "condition": "good",
  "estimatedValue": 150,
  "brand": "Canon",
  "model": "AE-1",
  "lookingFor": ["Digital Camera", "Lens"],
  "openToOffers": true
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

## 4. Offer Endpoints

### GET /offers
Get user's offers (sent and received).

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
      "message": "Would love to swap!",
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
  "targetItemId": "uuid",
  "offeredItemIds": ["uuid1", "uuid2"],
  "message": "I'd love to swap for this!",
  "suggestedMeetingPlace": "Central Park"
}
```

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
  "message": "How about these instead?"
}
```

### DELETE /offers/:offerId
Cancel an offer.

---

## 5. Messaging Endpoints

### GET /conversations
Get user's conversations.

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

## 6. Search Endpoints

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

## 7. Category Endpoints

### GET /categories
Get all categories.

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

## 8. Favorite Endpoints

### GET /favorites
Get user's favorites.

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

