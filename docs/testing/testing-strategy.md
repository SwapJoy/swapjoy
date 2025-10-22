# Testing Strategy

## Testing Pyramid

```
         /\
        /  \
       / E2E \         10% - End-to-End Tests
      /______\
     /        \
    /Integration\      30% - Integration Tests
   /____________\
  /              \
 /  Unit Tests    \    60% - Unit Tests
/__________________\
```

## 1. Unit Testing

### Backend Unit Tests

**Framework:** Jest

**Coverage Target:** 80%+ for business logic

**What to Test:**
- Service methods
- Utility functions
- Validation logic
- Data transformations
- Business rules
- Edge cases

**Example:**
```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = createMockRepository();
    service = new UserService(userRepository);
  });

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await service.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(result.password).not.toBe(userData.password);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.createUser({ email: 'existing@example.com' })
      ).rejects.toThrow('Email already exists');
    });
  });
});
```

### Mobile Unit Tests

**Framework:** Jest + React Native Testing Library

**What to Test:**
- Component logic
- Custom hooks
- Utility functions
- Redux reducers/actions
- Data transformations

**Example:**
```typescript
// ItemCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import ItemCard from './ItemCard';

describe('ItemCard', () => {
  const mockItem = {
    id: '1',
    title: 'Test Item',
    imageUrl: 'https://...',
    distance: 2.5,
  };

  it('renders item information correctly', () => {
    const { getByText } = render(<ItemCard item={mockItem} />);
    
    expect(getByText('Test Item')).toBeTruthy();
    expect(getByText('2.5 km away')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <ItemCard item={mockItem} onPress={onPressMock} />
    );
    
    fireEvent.press(getByTestId('item-card'));
    expect(onPressMock).toHaveBeenCalledWith(mockItem);
  });
});
```

## 2. Integration Testing

### API Integration Tests

**Framework:** Jest + Supertest

**What to Test:**
- API endpoints
- Request/response flow
- Database interactions
- Authentication/authorization
- Error handling

**Setup:**
- Use test database
- Seed data before tests
- Clean up after tests

**Example:**
```typescript
// items.e2e.spec.ts
describe('Items API', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /items', () => {
    it('should create a new item', async () => {
      const itemData = {
        title: 'Vintage Camera',
        description: 'Great condition',
        categoryId: 'category-uuid',
        condition: 'good',
      };

      const response = await request(app.getHttpServer())
        .post('/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(itemData)
        .expect(201);

      expect(response.body.data.title).toBe(itemData.title);
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/items')
        .send({})
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Missing description' })
        .expect(400);
    });
  });

  describe('GET /items', () => {
    it('should return items with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/items?category=electronics&radius=50')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
  });
});
```

### Component Integration Tests

**What to Test:**
- Screen/page flows
- Component interactions
- Navigation
- State management integration

**Example:**
```typescript
// LoginScreen.integration.test.tsx
describe('LoginScreen Integration', () => {
  it('should login user and navigate to home', async () => {
    const { getByPlaceholder, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <LoginScreen />
        </NavigationContainer>
      </Provider>
    );

    fireEvent.changeText(
      getByPlaceholder('Email'),
      'test@example.com'
    );
    fireEvent.changeText(
      getByPlaceholder('Password'),
      'password123'
    );
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
  });
});
```

## 3. End-to-End Testing

### Mobile E2E Tests

**Framework:** Detox

**What to Test:**
- Critical user journeys
- Complete flows (signup to swap)
- Cross-screen interactions
- Real device behavior

**Example:**
```typescript
// swap.e2e.ts
describe('Complete Swap Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete entire swap journey', async () => {
    // 1. Register
    await element(by.id('register-button')).tap();
    await element(by.id('email-input')).typeText('newuser@test.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('submit-register')).tap();

    // 2. Create item
    await element(by.id('add-item-button')).tap();
    await element(by.id('title-input')).typeText('My Camera');
    await element(by.id('description-input')).typeText('Great camera');
    await element(by.id('category-picker')).tap();
    await element(by.text('Electronics')).tap();
    await element(by.id('publish-button')).tap();

    // 3. Browse items
    await element(by.id('home-tab')).tap();
    await element(by.id('item-card-0')).tap();

    // 4. Make offer
    await element(by.id('make-offer-button')).tap();
    await element(by.id('select-item')).tap();
    await element(by.id('send-offer-button')).tap();

    // Verify offer sent
    await expect(element(by.text('Offer Sent!'))).toBeVisible();
  });
});
```

### API E2E Tests

**Framework:** Postman/Newman or custom scripts

**What to Test:**
- Complete API workflows
- Multiple endpoint interactions
- Real data scenarios

## 4. Performance Testing

### Load Testing

**Tools:** Artillery, k6, JMeter

**Scenarios:**
- Normal load (100 concurrent users)
- Peak load (1000 concurrent users)
- Stress test (beyond capacity)
- Soak test (extended period)

**Example Artillery Config:**
```yaml
# load-test.yml
config:
  target: "https://api.swapjoy.com"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Normal load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Browse and search items"
    flow:
      - get:
          url: "/items"
      - get:
          url: "/items/{{ itemId }}"
      - get:
          url: "/search?q=camera"
```

**Metrics to Track:**
- Response time (P50, P95, P99)
- Throughput (requests/second)
- Error rate
- CPU/Memory usage

### Mobile Performance Testing

**Tools:** React Native Performance Monitor, Flipper

**Metrics:**
- Time to Interactive (TTI)
- Frame rate (should be 60 FPS)
- Memory usage
- Bundle size
- App launch time

## 5. Security Testing

### Automated Security Scans

**Tools:**
- OWASP ZAP (API security)
- npm audit (dependencies)
- Snyk (vulnerability scanning)
- SonarQube (code quality + security)

**What to Test:**
- SQL injection
- XSS vulnerabilities
- CSRF protection
- Authentication/authorization
- Sensitive data exposure
- Rate limiting

### Penetration Testing

**When:** Before major releases, annually

**Focus Areas:**
- API security
- Authentication bypass
- Data access controls
- File upload vulnerabilities
- Session management

## 6. Accessibility Testing

**Tools:**
- iOS Accessibility Inspector
- Android Accessibility Scanner
- React Native Accessibility API

**What to Test:**
- Screen reader support
- Touch target sizes
- Color contrast
- Focus management
- Keyboard navigation

## 7. Visual Regression Testing

**Tools:** Percy, Chromatic, Applitools

**What to Test:**
- UI component changes
- Screenshot comparison
- Cross-device rendering

## 8. Testing Environments

### Local Development
- Developer's machine
- Docker containers
- Mock services

### CI Environment
- GitHub Actions runners
- Automated test execution
- Test reports generated

### Staging Environment
- Mirror of production
- Integration testing
- E2E testing
- User acceptance testing (UAT)

### Production Monitoring
- Synthetic monitoring
- Real user monitoring (RUM)
- Error tracking

## 9. Test Data Management

### Test Data Strategy

**Development:**
- Seed scripts
- Faker.js for realistic data
- Fixed test users

**Staging:**
- Anonymized production data
- Regular refresh from production

**Production:**
- Never test in production
- Use canary releases for validation

### Test Data Examples
```typescript
// test-data.factory.ts
export const createTestUser = (overrides = {}) => ({
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: 'Test123!',
  ...overrides,
});

export const createTestItem = (overrides = {}) => ({
  title: faker.commerce.productName(),
  description: faker.lorem.paragraph(),
  condition: faker.helpers.arrayElement(['new', 'good', 'fair']),
  categoryId: 'category-uuid',
  ...overrides,
});
```

## 10. Continuous Testing

### Test Automation in CI/CD

**On Pull Request:**
- Lint checks
- Unit tests
- Integration tests
- Security scans

**On Merge to Develop:**
- All PR checks
- E2E tests (subset)
- Deploy to staging

**On Merge to Main:**
- Full test suite
- Performance tests
- Security audit
- Deploy to production

### Test Reporting

**Metrics to Track:**
- Test coverage
- Test execution time
- Flaky tests
- Test failures
- Code coverage trends

**Tools:**
- Jest coverage reports
- Codecov/Coveralls
- Allure reports
- Custom dashboards

## 11. Testing Best Practices

### General Principles
- ✅ Write tests before fixing bugs (TDD)
- ✅ Test behavior, not implementation
- ✅ Keep tests independent
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Mock external dependencies
- ✅ Test edge cases and error scenarios

### Anti-Patterns
- ❌ Testing internal implementation
- ❌ Large, complex tests
- ❌ Tests with dependencies on order
- ❌ Hardcoded test data
- ❌ Ignoring flaky tests
- ❌ No assertions
- ❌ Testing third-party libraries

## 12. Test Maintenance

### Regular Activities
- Review and update tests with code changes
- Refactor duplicate test code
- Fix flaky tests immediately
- Remove obsolete tests
- Update test data
- Review coverage gaps

### Test Review Checklist
- [ ] Tests cover new functionality
- [ ] Edge cases included
- [ ] Error scenarios tested
- [ ] Test names are descriptive
- [ ] No flaky tests
- [ ] Mock external services
- [ ] Tests are fast
- [ ] Coverage maintained/improved

