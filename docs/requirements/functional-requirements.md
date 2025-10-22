# Functional Requirements

## 1. User Management

### FR-UM-001: User Registration
- **Priority:** High
- **Description:** Users shall be able to register using email/password or OAuth providers
- **Acceptance Criteria:**
  - Email validation
  - Password strength requirements (min 8 chars, uppercase, lowercase, number, special char)
  - OAuth support for Google, Apple, Facebook
  - Email verification required
  - Terms and conditions acceptance

### FR-UM-002: User Authentication
- **Priority:** High
- **Description:** Users shall be able to login securely
- **Acceptance Criteria:**
  - JWT-based authentication
  - Refresh token support
  - Session management
  - "Remember me" option
  - Account lockout after failed attempts

### FR-UM-003: Profile Management
- **Priority:** High
- **Description:** Users can create and manage their profiles
- **Acceptance Criteria:**
  - Profile photo upload (max 5MB, jpg/png)
  - Name, bio, location
  - Privacy settings
  - Account deletion option

### FR-UM-004: User Verification
- **Priority:** Medium
- **Description:** Multi-level user verification system
- **Acceptance Criteria:**
  - Email verification (required)
  - Phone verification (optional)
  - ID verification (optional, for premium)
  - Verification badges displayed

## 2. Item Management

### FR-IM-001: Create Item Listing
- **Priority:** High
- **Description:** Users can list items for swapping
- **Acceptance Criteria:**
  - Title (required, max 255 chars)
  - Description (required, max 5000 chars)
  - Category selection (required)
  - Condition rating (required)
  - 1-10 photos (first is required)
  - Estimated value (optional)
  - Specifications (optional)

### FR-IM-002: Edit Item Listing
- **Priority:** High
- **Description:** Users can edit their item listings
- **Acceptance Criteria:**
  - Only item owner can edit
  - All fields editable except ID and creation date
  - Image reordering
  - Change availability status

### FR-IM-003: Delete Item Listing
- **Priority:** High
- **Description:** Users can delete their items
- **Acceptance Criteria:**
  - Only owner can delete
  - Soft delete if offers exist
  - Hard delete if no offers
  - Confirmation required

### FR-IM-004: Browse Items
- **Priority:** High
- **Description:** Users can browse available items
- **Acceptance Criteria:**
  - List view and grid view
  - Filter by category
  - Filter by condition
  - Filter by distance
  - Sort options (newest, nearest, most relevant)
  - Pagination (20 items per page)

### FR-IM-005: Search Items
- **Priority:** High
- **Description:** Full-text search for items
- **Acceptance Criteria:**
  - Search by keywords
  - Autocomplete suggestions
  - Fuzzy matching
  - Search history
  - Advanced filters

### FR-IM-006: Item Details
- **Priority:** High
- **Description:** View detailed item information
- **Acceptance Criteria:**
  - Photo gallery
  - Full description
  - User info with rating
  - Distance from user
  - Similar items suggestion

## 3. Location Services

### FR-LS-001: Location Detection
- **Priority:** High
- **Description:** Automatic user location detection
- **Acceptance Criteria:**
  - GPS-based location
  - Permission request
  - Fallback to manual entry
  - Location privacy settings

### FR-LS-002: Distance Filtering
- **Priority:** High
- **Description:** Filter items by distance
- **Acceptance Criteria:**
  - Radius selection (5, 10, 25, 50, 100+ km)
  - Accurate distance calculation
  - Update results in real-time

### FR-LS-003: Map View
- **Priority:** Medium
- **Description:** View items on a map
- **Acceptance Criteria:**
  - Interactive map
  - Item markers
  - Cluster markers for nearby items
  - Tap marker to view item

## 4. Offer Management

### FR-OM-001: Create Offer
- **Priority:** High
- **Description:** Users can propose swaps
- **Acceptance Criteria:**
  - Select target item
  - Select 1+ own items to offer
  - Add message (max 1000 chars)
  - Suggest meeting location (optional)
  - Send offer

### FR-OM-002: View Offers
- **Priority:** High
- **Description:** View sent and received offers
- **Acceptance Criteria:**
  - Separate tabs for sent/received
  - Status indicators
  - Filter by status
  - Unread badge

### FR-OM-003: Accept/Decline Offers
- **Priority:** High
- **Description:** Respond to offers
- **Acceptance Criteria:**
  - Accept button
  - Decline button with optional reason
  - Notification sent to sender
  - Status update

### FR-OM-004: Counter Offer
- **Priority:** Medium
- **Description:** Make counter offers
- **Acceptance Criteria:**
  - Propose different items
  - Reference original offer
  - Message to explain
  - Track offer chain

### FR-OM-005: Cancel Offer
- **Priority:** Medium
- **Description:** Cancel pending offers
- **Acceptance Criteria:**
  - Only sender can cancel pending offers
  - Cannot cancel accepted offers
  - Notification sent

## 5. Messaging

### FR-MS-001: In-App Chat
- **Priority:** High
- **Description:** Real-time messaging between users
- **Acceptance Criteria:**
  - Text messages
  - Real-time delivery
  - Message history
  - Typing indicators
  - Read receipts

### FR-MS-002: Conversation Management
- **Priority:** High
- **Description:** Manage conversations
- **Acceptance Criteria:**
  - Conversation list
  - Unread count
  - Last message preview
  - Delete conversation
  - Mute notifications

### FR-MS-003: Block Users
- **Priority:** Medium
- **Description:** Block unwanted users
- **Acceptance Criteria:**
  - Block from profile or chat
  - Blocked users cannot message
  - Blocked users cannot see items
  - Unblock option

## 6. Swap Execution

### FR-SE-001: Schedule Swap
- **Priority:** High
- **Description:** Coordinate swap meeting
- **Acceptance Criteria:**
  - Suggest meeting location
  - Suggest meeting time
  - Add to calendar
  - Meeting reminders

### FR-SE-002: Confirm Swap
- **Priority:** High
- **Description:** Confirm swap completion
- **Acceptance Criteria:**
  - Both users confirm
  - Mark items as swapped
  - Trigger review request
  - Update stats

## 7. Reviews & Ratings

### FR-RR-001: Rate Users
- **Priority:** High
- **Description:** Rate swap partners
- **Acceptance Criteria:**
  - 1-5 star rating (required)
  - Written review (optional, max 500 chars)
  - Category ratings (communication, accuracy, punctuality)
  - One review per swap

### FR-RR-002: View Reviews
- **Priority:** High
- **Description:** View user reviews
- **Acceptance Criteria:**
  - Average rating display
  - Review list
  - Sort by date
  - Report inappropriate reviews

## 8. Notifications

### FR-NT-001: Push Notifications
- **Priority:** High
- **Description:** Real-time notifications
- **Acceptance Criteria:**
  - New offer notification
  - Offer accepted/declined
  - New message
  - Swap reminders
  - Custom preferences

### FR-NT-002: In-App Notifications
- **Priority:** Medium
- **Description:** Notification center
- **Acceptance Criteria:**
  - Notification list
  - Mark as read
  - Clear all
  - Navigate to related content

## 9. Search & Discovery

### FR-SD-001: Smart Matching
- **Priority:** Medium
- **Description:** AI-powered item matching
- **Acceptance Criteria:**
  - Match based on wishlist
  - Match based on browsing history
  - Match notifications
  - Match score display

### FR-SD-002: Recommendations
- **Priority:** Medium
- **Description:** Personalized recommendations
- **Acceptance Criteria:**
  - Based on user interests
  - Based on past swaps
  - Location-aware
  - Category-based

## 10. Safety & Trust

### FR-ST-001: Report System
- **Priority:** High
- **Description:** Report users and items
- **Acceptance Criteria:**
  - Report reasons list
  - Description field
  - Anonymous reporting
  - Admin review

### FR-ST-002: Safety Guidelines
- **Priority:** Medium
- **Description:** Safety information
- **Acceptance Criteria:**
  - Meeting safety tips
  - Scam prevention
  - Public place suggestions
  - Emergency contact info

## 11. Favorites & Wishlist

### FR-FW-001: Save Favorites
- **Priority:** Medium
- **Description:** Save items to favorites
- **Acceptance Criteria:**
  - Heart/bookmark button
  - Favorites list
  - Remove from favorites
  - Notification if swapped

### FR-FW-002: Wishlist
- **Priority:** Medium
- **Description:** Create wish lists
- **Acceptance Criteria:**
  - Multiple wishlists
  - Add items/categories
  - Match alerts
  - Share wishlist

## 12. Analytics

### FR-AN-001: User Dashboard
- **Priority:** Low
- **Description:** Personal analytics
- **Acceptance Criteria:**
  - Total swaps
  - Total value exchanged
  - Environmental impact
  - Badges/achievements
  - Activity graph

