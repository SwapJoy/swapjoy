# Authentication System Guide

This guide explains the comprehensive authentication system implemented in SwapJoy mobile app.

## Overview

The authentication system provides:
- ✅ Phone number OTP verification
- ✅ Automatic user creation in database
- ✅ Secure token storage (iOS Keychain / Android Keystore)
- ✅ Automatic token refresh
- ✅ Session persistence across app launches
- ✅ Authentication guards for all API calls
- ✅ Global auth state management

## Architecture

### 1. AuthService (`services/auth.ts`)
Central service handling all authentication operations:
- Token management with secure storage
- Automatic token refresh
- User creation in database
- Session persistence

### 2. AuthContext (`contexts/AuthContext.tsx`)
React context providing global authentication state:
- User information
- Session data
- Authentication status
- Sign in/out methods

### 3. ApiService (`services/api.ts`)
Authenticated API wrapper ensuring all calls include valid tokens:
- Automatic token injection
- Error handling for expired tokens
- Pre-built methods for common operations

## Key Features

### 1. Automatic User Creation
When a user successfully verifies their phone number:
- If user doesn't exist in database → automatically creates user record
- If user exists → updates last login time
- Handles both Supabase auth and fallback scenarios

### 2. Secure Token Storage
- Uses `expo-secure-store` for cross-platform secure storage
- Stores access token, refresh token, and full session
- Tokens are encrypted and stored in device keychain/keystore

### 3. Automatic Token Refresh
- Checks token expiration before API calls
- Automatically refreshes expired tokens
- Seamless user experience without re-authentication

### 4. Session Persistence
- User stays logged in across app launches
- Automatic session restoration on app start
- Handles token refresh in background

### 5. Authentication Guards
- All API calls require authentication
- Automatic token injection
- Error handling for authentication failures

## Usage Examples

### Using Auth Context
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  return (
    <View>
      <Text>Welcome, {user?.first_name}!</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  );
}
```

### Making Authenticated API Calls
```tsx
import { ApiService } from '../services/api';

// All API calls are automatically authenticated
const { data, error } = await ApiService.getItems();
const { data, error } = await ApiService.createItem(itemData);
const { data, error } = await ApiService.updateProfile(updates);
```

### Manual Authentication
```tsx
import { AuthService } from '../services/auth';

// Check if user is authenticated
const isAuth = await AuthService.isAuthenticated();

// Get current user
const user = await AuthService.getCurrentUser();

// Get access token
const token = await AuthService.getAccessToken();
```

## Security Features

### 1. Token Security
- Tokens stored in device secure storage
- Automatic token rotation
- Secure token transmission

### 2. API Security
- All API calls require valid authentication
- Automatic token validation
- Error handling for security issues

### 3. Session Management
- Secure session storage
- Automatic session cleanup on logout
- Session validation on app launch

## Database Integration

### User Creation
When a user verifies their phone number:
1. Check if user exists in `users` table
2. If not exists, create user record with:
   - Phone number
   - Generated username
   - Default profile information
   - Phone verification status
3. Link to Supabase auth user ID

### User Data Structure
```typescript
interface User {
  id: string;                    // Supabase auth user ID
  phone?: string;                // Verified phone number
  email?: string;                // Optional email
  username?: string;             // Unique username
  first_name?: string;           // User's first name
  last_name?: string;            // User's last name
  phone_verified?: boolean;      // Phone verification status
  email_verified?: boolean;      // Email verification status
  created_at?: string;           // Account creation date
  updated_at?: string;           // Last update date
}
```

## Error Handling

### Authentication Errors
- Invalid OTP codes
- Expired tokens
- Network connectivity issues
- Server errors

### API Errors
- Authentication required
- Token expired
- Permission denied
- Server errors

### Fallback Scenarios
- SMS provider issues (uses test code 1234)
- Network connectivity problems
- Server maintenance

## Testing

### Test OTP Code
For development/testing, use OTP code: `1234`

### Test Scenarios
1. **New User Flow**: Phone → OTP → User Creation → Login
2. **Existing User Flow**: Phone → OTP → Login
3. **Token Refresh**: Automatic background refresh
4. **Session Persistence**: App restart → Auto login
5. **API Authentication**: All calls require valid tokens

## Configuration

### Required Dependencies
```json
{
  "expo-secure-store": "^12.0.0",
  "@supabase/supabase-js": "^2.76.1",
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

### Environment Variables
```typescript
// config/supabase.ts
export const SUPABASE_URL = 'your-supabase-url';
export const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

## Best Practices

### 1. Always Use Auth Context
- Use `useAuth()` hook for authentication state
- Don't access Supabase auth directly in components

### 2. Use ApiService for API Calls
- All API calls should go through `ApiService`
- Automatic authentication handling
- Consistent error handling

### 3. Handle Loading States
- Check `isLoading` from auth context
- Show loading indicators during authentication

### 4. Error Handling
- Always handle authentication errors
- Provide user-friendly error messages
- Implement retry mechanisms

## Troubleshooting

### Common Issues

1. **User not created in database**
   - Check Supabase RLS policies
   - Verify user table exists
   - Check console for errors

2. **Token refresh failing**
   - Check network connectivity
   - Verify Supabase configuration
   - Check token expiration

3. **Session not persisting**
   - Check secure storage permissions
   - Verify expo-secure-store installation
   - Check device storage availability

### Debug Information
Enable debug logging by checking console output for:
- Authentication flow steps
- Token refresh attempts
- API call authentication
- Error details

## Future Enhancements

### Planned Features
- Email authentication
- Social login (Google, Apple)
- Biometric authentication
- Multi-factor authentication
- Session management dashboard

### Security Improvements
- Token rotation policies
- Device fingerprinting
- Suspicious activity detection
- Enhanced audit logging
