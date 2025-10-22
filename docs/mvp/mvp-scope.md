# MVP Scope - Minimum Viable Product

## Overview
The SwapJoy MVP will focus on core functionality needed to validate the concept and gather user feedback. The goal is to launch quickly with essential features while maintaining quality.

## MVP Timeline
**Target:** 3-4 months from kickoff to launch

**Phases:**
- Phase 1 (Month 1): Backend API + Database
- Phase 2 (Month 2): Mobile App Core Features
- Phase 3 (Month 3): Testing + Polish
- Phase 4 (Month 4): Beta Launch + Iteration

## Core Features (MUST HAVE)

### 1. User Management ✓
- **Registration & Login:**
  - Email/password authentication
  - Email verification
  - Basic profile setup (name, photo, location)
  - Password reset

- **Profile:**
  - View/edit profile
  - Profile picture
  - Bio (optional)
  - Location (city-level)
  - Basic settings

**Excluded from MVP:**
- Social login (OAuth)
- Phone verification
- ID verification
- Profile badges

### 2. Item Listing ✓
- **Create Listing:**
  - Title and description
  - 1-5 photos (primary + optional additional)
  - Category selection (predefined list)
  - Condition (dropdown)
  - Post item

- **Manage Listings:**
  - View my items
  - Edit item
  - Delete item
  - Mark as unavailable

**Excluded from MVP:**
- Advanced specs (brand, model, dimensions)
- Estimated value
- "Looking for" field
- Bulk operations
- Item analytics

### 3. Browse & Search ✓
- **Browse:**
  - Home feed (nearby items)
  - Category browsing
  - Simple list view
  - Item cards (image, title, distance)

- **Search:**
  - Basic keyword search
  - Filter by category
  - Sort by newest/nearest

**Excluded from MVP:**
- Advanced filters (condition, value range)
- Autocomplete
- Search history
- Saved searches
- Map view

### 4. Location Services ✓
- **Basic Location:**
  - Auto-detect city via GPS
  - Manual city selection
  - Show distance to items
  - Filter by radius (fixed: 50km)

**Excluded from MVP:**
- Custom radius selection
- Map view
- Multiple saved locations
- Precise GPS coordinates

### 5. Offers ✓
- **Send Offer:**
  - Select target item
  - Select 1 of your items to offer
  - Add message
  - Send

- **Receive Offer:**
  - View offers
  - Accept or decline
  - View offer details

- **Offer Management:**
  - View sent offers
  - View received offers
  - Cancel pending offer

**Excluded from MVP:**
- Multi-item bundles
- Counter offers
- Offer expiration
- Meeting location suggestions
- Offer history after completion

### 6. User Following ✓
- **Follow Users:**
  - Follow/unfollow other users
  - View followers list
  - View following list
  - See followed users' new listings

**Excluded from MVP:**
- Activity feed from followed users
- Follow suggestions
- Mutual followers display
- Follow notifications (beyond basic)

### 7. Contact Coordination (No In-App Chat) ✓
- **Contact Methods:**
  - View other user's contact preferences
  - External communication (phone, email, WhatsApp)
  - No in-app messaging for MVP

**Note:** Users coordinate swaps outside the app via their preferred method.

### 8. Swap Completion ✓
- **Complete Swap:**
  - Both users confirm completion
  - Mark items as swapped
  - Simple success message

**Excluded from MVP:**
- Meeting scheduling
- Calendar integration
- Swap reminders
- Meeting location suggestions

### 9. Reviews & Ratings ✓
- **Basic Reviews:**
  - 5-star rating (required)
  - Optional text review
  - One review per swap
  - View user's average rating

**Excluded from MVP:**
- Category ratings (communication, accuracy, etc.)
- Review responses
- Report reviews
- Review analytics

### 10. Notifications ✓
- **Push Notifications:**
  - New offer received
  - Offer accepted/declined
  - New follower
  - Swap confirmed by other user
  - Basic notification settings (on/off)

**Excluded from MVP:**
- In-app notification center
- Email notifications
- SMS notifications
- Granular notification preferences
- Match alerts
- New message notifications (no chat in MVP)

### 11. Safety ✓
- **Basic Safety:**
  - Block user
  - Report user/item (simple form)
  - Basic safety tips page

**Excluded from MVP:**
- User verification system
- Reputation badges
- Detailed moderation
- Meeting safety features

## Nice to Have (POST-MVP)

### Phase 2 Features (High Priority)
- **In-app messaging/chat** (currently external)
- Item favorites/wishlist
- Advanced search filters
- Map view
- Multi-item offers
- Counter offers
- Enhanced profiles with more details
- Activity feed from followed users
- Real-time chat with typing indicators

### Phase 3 Features (Future)
- AI-powered matching
- Smart recommendations
- User verification system
- Premium features/subscriptions
- Gamification (badges, achievements)
- Community features (groups, events)
- Analytics dashboard
- Image sharing in chat
- Location sharing
- Video calls for item verification

## Technical MVP Scope

### Backend (Supabase)
- ✓ Supabase (Backend-as-a-Service)
- ✓ PostgreSQL database with PostGIS
- ✓ Supabase Auth (Email, Google, Facebook, Apple)
- ✓ Row Level Security (RLS)
- ✓ Auto-generated REST API
- ✓ Supabase Storage for images
- ✓ Supabase CDN
- ✓ Edge Functions for custom logic
- ✓ Real-time subscriptions (for notifications)
- ✓ SendGrid for emails (via Edge Functions)
- ✓ Firebase for push notifications

**Excluded:**
- Real-time chat (WebSocket for messaging) - Post-MVP
- GraphQL (use REST for MVP)
- Advanced caching strategies
- Message queues (direct processing)
- Complex Edge Functions (keep simple for MVP)

### Mobile App
- ✓ React Native
- ✓ iOS + Android
- ✓ Redux Toolkit for state management
- ✓ React Navigation
- ✓ Basic UI components
- ✓ Image upload/display
- ✓ Supabase client integration
- ✓ Push notifications
- ✓ Basic offline support (cached data)

**Excluded:**
- In-app chat/messaging (Post-MVP)
- Custom UI component library
- Advanced animations
- Offline-first architecture
- Background sync
- App theming

### Infrastructure
- ✓ Supabase managed hosting
- ✓ GitHub for version control
- ✓ Basic CI/CD (GitHub Actions)
- ✓ Development + Production environments
- ✓ Supabase Dashboard monitoring
- ✓ Error tracking (Sentry for mobile app)

**Excluded:**
- Custom server infrastructure
- Multi-region deployment (Supabase handles this)
- Complex auto-scaling configurations
- Advanced monitoring dashboards
- Load testing (defer to post-MVP)

## MVP Metrics for Success

### User Metrics
- 1,000+ registered users in first month
- 500+ items listed
- 100+ completed swaps
- 20% user retention (week 2)

### Technical Metrics
- 99% uptime
- < 2s average page load
- < 500ms API response time
- < 5% error rate

### User Satisfaction
- 4+ star average rating
- < 10% negative feedback
- Positive user testimonials

## Out of Scope for MVP

### Features NOT Included:
- ❌ **In-app chat/messaging** (use external communication)
- ❌ Web version (mobile only)
- ❌ Admin dashboard (use Supabase dashboard)
- ❌ Social sharing (Instagram, Facebook)
- ❌ Events/swap meets
- ❌ Groups/communities
- ❌ Premium subscriptions
- ❌ Payment processing
- ❌ Multi-language support
- ❌ Advanced analytics dashboard
- ❌ AI features (smart matching, recommendations)
- ❌ Video content
- ❌ Live streaming
- ❌ Marketplace integration
- ❌ Third-party integrations (beyond core services)

## MVP User Stories

### Primary User Journey
1. **As a new user**, I can register with email/social login and create my profile
2. **As a user**, I can list an item I want to swap with photos and description
3. **As a user**, I can browse items near me and search for what I want
4. **As a user**, I can follow other users whose items I like
5. **As a user**, I can make an offer on an item by proposing one of my items
6. **As an item owner**, I can accept or decline offers
7. **As users who accepted an offer**, we can see each other's contact info and coordinate externally (phone, WhatsApp, email)
8. **As users**, we can confirm the swap was completed in the app
9. **As users**, we can rate each other after the swap

## Launch Criteria

### Must Complete Before Launch:
- [ ] All MVP features implemented and tested
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Beta testing completed (50+ users)
- [ ] Critical bugs fixed
- [ ] App Store submission approved
- [ ] Privacy policy and ToS published
- [ ] Basic support system in place
- [ ] Monitoring and alerts configured

## Post-Launch Priorities

### Week 1-2:
- Monitor errors and crashes
- Fix critical bugs
- Gather user feedback
- Optimize performance bottlenecks

### Month 1:
- Analyze user behavior
- Iterate on UX issues
- Plan Phase 2 features based on feedback
- Improve onboarding conversion

### Month 2-3:
- Implement top requested features
- Expand to new cities/regions
- Marketing and growth initiatives
- Community building

## Resource Requirements

### Team (MVP):
- 1 Backend Developer
- 1 Mobile Developer (React Native)
- 1 UI/UX Designer
- 1 Product Manager / Project Lead
- 1 QA Tester (part-time)

### Tools & Services:
- GitHub (code repository)
- AWS (hosting)
- Sentry (error tracking)
- SendGrid (email)
- Firebase (push notifications)
- Cloudinary (image optimization)
- Figma (design)

### Estimated Costs (Monthly):
- AWS Infrastructure: $200-500
- Third-party services: $100-200
- Domain & SSL: $20
- **Total:** ~$320-720/month

