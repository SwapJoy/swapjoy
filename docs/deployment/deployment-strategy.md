# Deployment Strategy

## 1. Deployment Environments

### Development Environment
- **Purpose:** Local development and testing
- **Infrastructure:** Local Docker containers
- **Database:** Local PostgreSQL, Redis
- **Access:** Developers only
- **Data:** Synthetic/anonymized test data
- **URL:** http://localhost:3000

### Staging Environment
- **Purpose:** Pre-production testing, QA
- **Infrastructure:** Cloud-hosted (mirrors production)
- **Database:** Separate from production
- **Access:** Development team, QA, stakeholders
- **Data:** Anonymized production-like data
- **URL:** https://staging-api.swapjoy.com
- **Deploy:** Automatic on merge to `develop` branch

### Production Environment
- **Purpose:** Live user-facing application
- **Infrastructure:** Cloud-hosted with redundancy
- **Database:** High-availability setup
- **Access:** Public (app users), admins
- **Data:** Real user data
- **URL:** https://api.swapjoy.com
- **Deploy:** Manual approval required

## 2. Infrastructure Setup

### Cloud Provider: AWS (Recommended)

#### Services Used:
- **Compute:**
  - ECS (Elastic Container Service) with Fargate
  - Auto-scaling groups
  - Application Load Balancer

- **Database:**
  - RDS PostgreSQL (Multi-AZ)
  - ElastiCache Redis (cluster mode)
  - Read replicas for scaling

- **Storage:**
  - S3 for file storage
  - CloudFront CDN
  - Glacier for backups

- **Networking:**
  - VPC with public/private subnets
  - Route 53 for DNS
  - CloudFront for CDN
  - NAT Gateway

- **Monitoring:**
  - CloudWatch for logs and metrics
  - X-Ray for distributed tracing

- **Security:**
  - WAF for API protection
  - Shield for DDoS protection
  - Secrets Manager for credentials
  - IAM roles and policies

### Architecture Diagram

```
                    ┌──────────────┐
                    │   Route 53   │
                    │     (DNS)    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ CloudFront   │
                    │    (CDN)     │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             │                           │
      ┌──────▼───────┐           ┌──────▼───────┐
      │     WAF      │           │  S3 Bucket   │
      │  (Firewall)  │           │   (Images)   │
      └──────┬───────┘           └──────────────┘
             │
      ┌──────▼────────┐
      │ Load Balancer │
      └──────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼───┐
│  ECS   │      │   ECS   │
│Task 1  │ .... │ Task N  │
└───┬────┘      └─────┬───┘
    │                 │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼─────┐      ┌────▼────┐
│   RDS   │      │  Redis  │
│(Postgres)│     │ (Cache) │
└─────────┘      └─────────┘
```

## 3. Containerization

### Docker Setup

**Dockerfile (Backend):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**docker-compose.yml (Local Development):**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/swapjoy
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=swapjoy
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 4. CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches:
      - develop
      - main
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t swapjoy-api:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin
          docker tag swapjoy-api:${{ github.sha }} $ECR_REGISTRY/swapjoy-api:${{ github.sha }}
          docker push $ECR_REGISTRY/swapjoy-api:${{ github.sha }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: |
          aws ecs update-service --cluster staging --service swapjoy-api --force-new-deployment

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          aws ecs update-service --cluster production --service swapjoy-api --force-new-deployment
```

### Pipeline Stages

1. **Code Quality:**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Code formatting (Prettier)

2. **Testing:**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (limited on CI)

3. **Security:**
   - Dependency scanning (npm audit)
   - Vulnerability scanning (Snyk)
   - Container scanning

4. **Build:**
   - Docker image build
   - Image optimization
   - Tag with commit SHA

5. **Deploy:**
   - Push to container registry
   - Update ECS service
   - Health checks
   - Rollback on failure

## 5. Database Migrations

### Migration Strategy

**Using Prisma Migrate:**

```bash
# Create migration
npx prisma migrate dev --name add_user_verification

# Apply to production
npx prisma migrate deploy
```

**Migration Best Practices:**
- Migrations separate from deployments
- Run migrations before code deploy
- Test migrations on staging first
- Backward compatible migrations
- Data migrations in separate scripts
- Always have rollback plan

### Zero-Downtime Migrations

**Strategy:**
1. Add new column (nullable)
2. Deploy code that writes to both old and new
3. Backfill data
4. Deploy code that reads from new
5. Remove old column (separate migration)

## 6. Deployment Process

### Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing
- [ ] Code review approved
- [ ] Database migrations tested
- [ ] Environment variables updated
- [ ] Feature flags configured
- [ ] Rollback plan documented
- [ ] Stakeholders notified

**Deployment:**
- [ ] Tag release in Git
- [ ] Run database migrations
- [ ] Deploy application
- [ ] Verify health checks
- [ ] Smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics

**Post-Deployment:**
- [ ] Verify functionality
- [ ] Monitor for errors
- [ ] Check user feedback
- [ ] Update documentation
- [ ] Notify stakeholders

### Blue-Green Deployment

```
1. Current (Blue): Serving 100% traffic
2. Deploy New (Green): 0% traffic
3. Run tests on Green
4. Switch 10% traffic to Green (canary)
5. Monitor metrics
6. Gradually increase to 100% Green
7. Keep Blue for quick rollback
8. After stable period, retire Blue
```

### Rollback Procedure

**Automatic Rollback Triggers:**
- Health check failures
- Error rate > 5%
- Response time > 2x baseline
- Critical service unavailable

**Manual Rollback:**
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster production \
  --service swapjoy-api \
  --task-definition swapjoy-api:previous

# Or revert to previous image
kubectl rollout undo deployment/swapjoy-api
```

## 7. Monitoring & Alerts

### Health Checks

**Endpoint: GET /health**
```json
{
  "status": "healthy",
  "version": "1.2.3",
  "uptime": 12345,
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-21T10:00:00Z"
}
```

### Metrics to Monitor

**Application:**
- Request rate
- Response time (P50, P95, P99)
- Error rate
- 2xx, 4xx, 5xx responses

**Infrastructure:**
- CPU utilization
- Memory usage
- Disk I/O
- Network I/O

**Database:**
- Connection pool usage
- Query performance
- Replication lag
- Deadlocks

### Alert Thresholds

**Critical (Page On-Call):**
- Error rate > 5%
- Response time P99 > 5s
- Database down
- Service health check failed

**Warning (Slack/Email):**
- Error rate > 1%
- Response time P95 > 1s
- High CPU/memory usage
- Disk space > 80%

## 8. Mobile App Deployment

### iOS Deployment (App Store)

1. **Build:**
   ```bash
   npx react-native bundle --platform ios
   ```

2. **Archive:**
   - Xcode → Product → Archive
   - Or use Fastlane

3. **TestFlight:**
   - Upload to TestFlight for beta testing
   - Internal testing (team)
   - External testing (beta users)

4. **App Store Review:**
   - Submit for review
   - Respond to feedback
   - Approve for release

5. **Release:**
   - Manual release
   - Or automatic after approval

### Android Deployment (Google Play)

1. **Build:**
   ```bash
   ./gradlew bundleRelease
   ```

2. **Internal Testing:**
   - Upload to internal track
   - Team testing

3. **Beta Testing:**
   - Open/closed beta
   - Staged rollout

4. **Production:**
   - Release to production
   - Staged rollout (10%, 25%, 50%, 100%)

### Over-the-Air (OTA) Updates

**Using CodePush:**
```bash
# Release to staging
appcenter codepush release-react -a SwapJoy/iOS-Staging -d Staging

# Release to production (phased)
appcenter codepush release-react -a SwapJoy/iOS-Production -d Production --rollout 25%
```

**When to use OTA:**
- Bug fixes
- UI tweaks
- Content updates
- Non-native code changes

**When NOT to use OTA:**
- Native code changes
- Major features
- Breaking changes

## 9. Disaster Recovery

### Backup Strategy

**Automated Backups:**
- Database: Daily full, hourly incremental
- Files: Continuous to S3 (versioning enabled)
- Retention: 30 days

**Backup Testing:**
- Monthly restore test
- Document restore procedure
- Time restore process

### Recovery Procedures

**Database Failure:**
1. Automatic failover to standby (Multi-AZ)
2. If complete failure, restore from backup
3. Update DNS if needed
4. Verify data integrity

**Region Failure:**
1. Failover to backup region
2. Update Route 53 health checks
3. Redirect traffic
4. Sync data when primary recovered

**Data Loss:**
1. Identify last known good state
2. Restore from backup
3. Replay transaction logs (point-in-time recovery)
4. Verify data
5. Resume operations

## 10. Cost Optimization

### Strategies

- Use auto-scaling to match demand
- Reserved instances for baseline
- Spot instances for batch jobs
- Lifecycle policies for S3
- Right-size instances
- Cache frequently accessed data
- Optimize database queries
- Compress images
- Monitor and eliminate waste

