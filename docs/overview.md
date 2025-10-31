# SwapJoy - Project Overview

## Vision
SwapJoy is a mobile application that enables people to exchange items they no longer need for items they love within their geographic region.

## Mission
Create a sustainable, community-driven platform that promotes reuse and reduces waste by facilitating peer-to-peer item exchanges.

## Core Value Proposition
- **For Users**: Get what you want without spending money by trading what you don't need
- **For Community**: Reduce waste and promote sustainable consumption
- **For Environment**: Extend product lifecycle and reduce consumption

## Target Audience
- Individuals looking to declutter their homes
- People seeking specific items without financial transactions
- Environmentally conscious users
- Bargain hunters and collectors
- Students and young professionals

## Key Differentiators
1. Location-based matching
2. Bundle swapping capability
3. Direct peer-to-peer communication
4. No monetary transactions
5. Smart matching algorithm

## Profile Experience
- Circle avatar, full name, username, bio
- Favorite categories shown as centered chips (category names)
- Tabs: Published, Saved, Drafts (3-column grid; minimal UI; active underlined)
- Header gear icon → Settings (Edit Profile, Notifications, Privacy & Security, Help & Support, About)

## Data Flow
- Supabase tables: users, items, item_images, offers, offer_items, favorites, categories
- Redis-backed caching for shared/expensive queries
  - `all-categories` (active categories; used for ID→name mapping)
  - `user-stats:<user_id>` (simple aggregate stats)
  - `user-ratings:<user_id>`

## Notable Logic
- User stats: items listed; offers sent/received; accepted offers; success rate
- Item images: primary preferred; then lowest `sort_order`; fallback to thumbnail
- Profile values pulled from users row; fallbacks to auth metadata for missing fields

