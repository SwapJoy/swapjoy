# System Architecture

## Architecture Overview
SwapJoy uses **Supabase** as the Backend-as-a-Service (BaaS) platform, providing a complete serverless backend with PostgreSQL database, authentication, real-time subscriptions, and storage. The mobile-first approach uses React Native for cross-platform mobile apps.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   iOS App    │  │  Android App │  │   Web Admin  │      │
│  │ (React Native)│  │(React Native)│  │  (Future)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                      Supabase Client
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Supabase API Gateway                 │       │
│  │     (Auto-generated REST API + GraphQL)          │       │
│  │     (Authentication, RLS, Rate Limiting)         │       │
│  └──────────────────────────────────────────────────┘       │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐            │
│         │                  │                  │            │
│  ┌──────▼─────┐    ┌──────▼─────┐    ┌──────▼─────┐      │
│  │    Auth    │    │  Database  │    │  Storage   │      │
│  │            │    │(PostgreSQL)│    │   (S3)     │      │
│  │ • Email    │    │            │    │            │      │
│  │ • Google   │    │ • PostGIS  │    │ • Images   │      │
│  │ • Facebook │    │ • Full-text│    │ • Files    │      │
│  │ • Apple    │    │ • RLS      │    │ • CDN      │      │
│  └────────────┘    └────────────┘    └────────────┘      │
│                            │                                 │
│  ┌──────────────────┬─────┴─────┬──────────────────┐      │
│  │                  │           │                  │      │
│  ▼                  ▼           ▼                  ▼      │
│  Real-time      Edge         PgBouncer         Webhooks   │
│  Engine      Functions      (Connection         │         │
│    │            │             Pool)              │         │
└────┼────────────┼──────────────────────────────────────────┘
     │            │
     │            ▼
     │    ┌─────────────┐
     │    │ Custom      │
     │    │ Business    │
     │    │ Logic       │
     │    └─────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │  Firebase   │ │  SendGrid   │ │  Google     │          │
│  │    (FCM)    │ │   (Email)   │ │    Maps     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐                          │
│  │ Cloudinary  │ │  Analytics  │                          │
│  │ (Optional)  │ │  Services   │                          │
│  └─────────────┘ └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Supabase Services

### 1. Authentication Service
**Built-in Supabase Auth**
- Email/password authentication
- OAuth providers (Google, Facebook, Apple)
- JWT-based sessions
- Password reset
- Email verification
- User metadata
- Multi-factor authentication (future)

### 2. Database (PostgreSQL)
**Supabase PostgreSQL with Extensions**
- All application data
- PostGIS for geospatial queries
- Full-text search (pg_trgm)
- Row Level Security (RLS)
- Database triggers
- Views and materialized views
- Indexes for performance

### 3. Real-time Subscriptions
**Supabase Realtime**
- Real-time messaging
- Live notifications
- Presence tracking
- Database change listeners
- WebSocket connections
- Broadcast channels

### 4. Storage Service
**Supabase Storage**
- Image storage (profile, items)
- File uploads/downloads
- CDN integration
- Image transformations
- Public/private buckets
- Storage policies (RLS)

### 5. Edge Functions (Serverless)
**Supabase Edge Functions (Deno)**
- Custom business logic
- Complex operations
- Third-party integrations
- Image processing
- Push notifications
- Email sending
- Matching algorithms
- Scheduled tasks

### 6. Database Functions & Triggers
**PostgreSQL Functions**
- Geospatial queries (nearby items)
- Search functionality
- Complex aggregations
- Data validation
- Automatic timestamps
- Audit logging

## Architecture Patterns

### Backend-as-a-Service (BaaS)
- Supabase provides managed infrastructure
- Auto-generated REST and GraphQL APIs
- Serverless architecture
- No server management required
- Built-in security and performance

### Database-First Design
- Database is the source of truth
- Row Level Security for authorization
- Database triggers for business logic
- Views for complex queries
- Materialized views for analytics

### Real-time First
- WebSocket connections for live updates
- Database change subscriptions
- Presence tracking
- Broadcast channels for notifications

### Serverless Functions
- Edge Functions for custom logic
- Event-driven processing
- Auto-scaling
- Pay-per-use pricing
- Global distribution (Deno Deploy)

### Security by Default
- Row Level Security (RLS) on all tables
- JWT-based authentication
- API key rotation
- Encrypted connections (TLS)
- Audit logging

## Scalability Considerations

### Automatic Scaling (Supabase)
- Auto-scaling infrastructure
- Connection pooling (PgBouncer)
- Read replicas (Pro plan)
- Global CDN for storage
- Edge functions auto-scale

### Database Optimization
- Indexes on frequently queried columns
- Materialized views for analytics
- Partial indexes for filtered queries
- Geospatial indexes (PostGIS)
- Query optimization with EXPLAIN

### Performance Optimization
- Supabase CDN for images
- Client-side caching (React Query)
- Database query caching
- Image optimization (Cloudinary optional)
- Lazy loading and pagination
- Background processing via Edge Functions

## Security Architecture

### Authentication & Authorization
- **Supabase Auth:**
  - JWT-based sessions
  - OAuth 2.0 (Google, Facebook, Apple)
  - Email verification
  - Password reset flows
  - Session management
  
- **Row Level Security (RLS):**
  - Database-level authorization
  - Policy-based access control
  - User can only access their data
  - Fine-grained permissions

### Data Security
- **Encryption:**
  - TLS/SSL for all connections
  - Encrypted data at rest
  - Encrypted backups
  - Secure credential storage

- **Privacy:**
  - GDPR compliance tools
  - Data export capabilities
  - Right to deletion
  - Anonymization options

### Infrastructure Security
- **Supabase Managed:**
  - DDoS protection
  - Firewall rules
  - Network isolation
  - Regular security updates
  - SOC 2 Type II certified
  
- **API Security:**
  - Rate limiting
  - API key management
  - CORS configuration
  - Request validation

