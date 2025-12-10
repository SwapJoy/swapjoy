# SwapJoy

SwapJoy is a mobile app that helps people exchange what they no longer need for what they love in their specific geographic region. Users can explore or search for the best matching items or item bundles, send or receive offers, and coordinate swaps within their community.

## 📋 Documentation

### Getting Started
- [Overview](docs/overview.md) - Project vision and goals
- [Quick Start Guide](docs/getting-started/quick-start.md) - Set up and run the project
- [MVP Scope](docs/mvp/mvp-scope.md) - Minimum viable product definition

### Architecture
- [System Architecture](docs/architecture/system-architecture.md) - High-level system design
- [Mobile Architecture](docs/architecture/mobile-architecture.md) - React Native app structure
- [Supabase Backend](docs/tech-stack/supabase-backend.md) - Backend architecture with Supabase

### Features
- [Core Features](docs/features/core-features.md) - Essential app features
- [Advanced Features](docs/features/advanced-features.md) - Future enhancements

### Technical Stack
- [Supabase Backend](docs/tech-stack/supabase-backend.md) - Supabase setup and configuration
- [Frontend/Mobile Stack](docs/tech-stack/frontend-stack.md) - React Native technology choices

### Requirements
- [Functional Requirements](docs/requirements/functional-requirements.md) - What the app must do
- [Non-Functional Requirements](docs/requirements/non-functional-requirements.md) - Performance, security, etc.

### Data & API
- [Database Schema](docs/data-models/database-schema.md) - Complete database structure
- [Supabase Auth Setup](docs/data-models/supabase-auth-setup.md) - Authentication configuration
- [Supabase Vector AI](docs/SUPABASE_VECTOR_AI.md) - AI-powered recommendations
- [API Endpoints](docs/api/api-endpoints.md) - API reference documentation

### User Experience
- [User Flows](docs/flows/user-flows.md) - Step-by-step user journeys

### Security
- [Security Considerations](docs/security/security-considerations.md) - Security best practices

### Operations
- [Deployment Strategy](docs/deployment/deployment-strategy.md) - How to deploy the app
- [Testing Strategy](docs/testing/testing-strategy.md) - Testing approach and guidelines

## 🎯 Quick Links

### For Developers
- [Quick Start](docs/getting-started/quick-start.md) - Get up and running
- [System Architecture](docs/architecture/system-architecture.md) - Understand the system
- [Database Schema](docs/data-models/database-schema.md) - Database structure
- [Testing Strategy](docs/testing/testing-strategy.md) - How to test

### For Product Managers
- [Overview](docs/overview.md) - Product vision
- [Core Features](docs/features/core-features.md) - Feature list
- [MVP Scope](docs/mvp/mvp-scope.md) - Launch plan
- [User Flows](docs/flows/user-flows.md) - User experience

### For Designers
- [User Flows](docs/flows/user-flows.md) - User journeys
- [Core Features](docs/features/core-features.md) - UI requirements
- [Mobile Architecture](docs/architecture/mobile-architecture.md) - App structure

### For DevOps
- [Deployment Strategy](docs/deployment/deployment-strategy.md) - Deployment process
- [Supabase Backend](docs/tech-stack/supabase-backend.md) - Infrastructure
- [Security Considerations](docs/security/security-considerations.md) - Security setup

## 🏗️ Project Structure

```
swapjoy/
├── docs/                           # Documentation
│   ├── overview.md                 # Project overview
│   ├── SUPABASE_VECTOR_AI.md       # AI matching system
│   ├── architecture/               # Architecture documentation
│   │   ├── system-architecture.md
│   │   └── mobile-architecture.md
│   ├── features/                   # Feature documentation
│   │   ├── core-features.md
│   │   └── advanced-features.md
│   ├── tech-stack/                 # Technology choices
│   │   ├── supabase-backend.md
│   │   └── frontend-stack.md
│   ├── requirements/               # Requirements
│   │   ├── functional-requirements.md
│   │   └── non-functional-requirements.md
│   ├── data-models/                # Data structure
│   │   ├── database-schema.md
│   │   └── supabase-auth-setup.md
│   ├── api/                        # API documentation
│   │   └── api-endpoints.md
│   ├── flows/                      # User flows
│   │   └── user-flows.md
│   ├── security/                   # Security documentation
│   │   └── security-considerations.md
│   ├── deployment/                 # Deployment guides
│   │   └── deployment-strategy.md
│   ├── testing/                    # Testing documentation
│   │   └── testing-strategy.md
│   ├── mvp/                        # MVP planning
│   │   └── mvp-scope.md
│   └── getting-started/            # Getting started guides
│       └── quick-start.md
├── src/                            # Source code (to be created)
├── supabase/                       # Supabase configuration
│   ├── migrations/                 # Database migrations
│   └── functions/                  # Edge functions
└── README.md                       # This file

```

## 🚀 Technology Stack

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with PostGIS
  - pgvector for AI recommendations
  - Authentication (Email, Phone, Google, Facebook, Apple)
  - Real-time subscriptions
  - Storage with CDN
  - Edge Functions

### Mobile App
- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **React Navigation** - Navigation
- **Supabase Client** - Backend integration
- **React Query** - Server state management

### Third-Party Services
- **Firebase** - Push notifications
- **OpenAI** - Vector embeddings for AI matching
- **SendGrid** - Email notifications

## 📱 Supported Platforms

- **iOS:** 15, 16, 17+
- **Android:** 11, 12, 13, 14+

## 🔐 Authentication

- **Email/Password** - Traditional email registration
- **Phone Number** - SMS OTP authentication
- **Google OAuth** - Sign in with Google
- **Facebook OAuth** - Sign in with Facebook  
- **Apple Sign In** - Sign in with Apple (iOS)

## 🎯 Key Features

### MVP Features
- ✅ Multi-provider authentication
- ✅ Item listing with photos
- ✅ Location-based browsing
- ✅ AI-powered recommendations (pgvector)
- ✅ Flexible swap offers (1-to-1, 1-to-many, many-to-many)
- ✅ User following system
- ✅ External communication coordination
- ✅ Reviews and ratings
- ✅ Push notifications

### Post-MVP
- In-app messaging
- Advanced search filters
- Map view
- Counter offers
- Community features
- Premium subscriptions

## 📊 Project Status

**Current Phase:** Planning & Documentation ✅

**Next Steps:**
1. Set up Supabase project
2. Create database schema with migrations
3. Configure authentication providers
4. Set up pgvector for AI recommendations
5. Build React Native mobile app
6. Implement core features
7. Beta testing
8. Launch

## 🤝 Contributing

1. Read the documentation
2. Set up your development environment
3. Create a feature branch
4. Make your changes
5. Write tests
6. Submit a pull request

## 📞 Support

For questions or issues:
- Check the [documentation](docs/)
- Search existing issues
- Create a new issue
- Contact the team

## 📄 License

See [LICENSE](LICENSE) file for details.

---

**Last Updated:** October 2025  
**Version:** 1.0.0

