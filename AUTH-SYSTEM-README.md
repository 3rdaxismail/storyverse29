# Authentication System

Complete 6-page authentication system for Storyverse with mobile-first design and smooth animations.

## Pages

### 1. Welcome Page (`/welcome`)
- Entry point with emotional headline
- CTAs to Sign Up or Sign In
- Animated logo and text

### 2. Sign Up Page (`/signup`)
- Email and password registration
- Password confirmation
- Google sign-in option
- Password visibility toggle
- Privacy-first messaging

### 3. Sign In Page (`/signin`)
- Email and password login
- Google sign-in option
- Password visibility toggle
- Link to forgot password
- Error handling for invalid credentials

### 4. Forgot Password Page (`/forgot-password`)
- Email input for password reset
- Neutral success message (no user enumeration)
- Link back to sign in

### 5. Reset Password Page (`/reset-password?token=xxx`)
- Token-based password reset
- New password with confirmation
- Password strength validation
- Invalid/expired token handling

### 6. First-Time Profile Setup (`/profile-setup`)
- Appears after first signup
- Optional avatar upload (circular, 120px)
- Display name or pen name
- Optional short bio (160 chars max)
- Skip option available

## Features

### Design
- Mobile-first responsive design
- Premium, writer-focused UI
- Storyverse design tokens
- Dark theme throughout

### Animations
- Logo appears first (logoAppear, 0.8s)
- Headline fades in (fadeSlideUp, 0.6s + 0.1s delay)
- Form fields stagger (0.2s, 0.25s, 0.3s, 0.35s delays)
- Smooth transitions on all interactions

### Security
- Password visibility toggles
- Password strength validation
- Token-based password reset
- No user enumeration in forgot password flow

### Route Guards
- `ProtectedRoute`: Redirects unauthenticated users to `/welcome`
- `PublicRoute`: Redirects authenticated users to dashboard

### State Management
- `useAuth` hook for authentication state
- localStorage persistence
- Email, isAuthenticated, profileSetupComplete

## File Structure

```
src/
├── pages/auth/
│   ├── auth.css                    # Shared authentication styles
│   ├── WelcomePage.tsx             # Entry page
│   ├── SignUpPage.tsx              # Registration
│   ├── SignInPage.tsx              # Login
│   ├── ForgotPasswordPage.tsx      # Password recovery request
│   ├── ResetPasswordPage.tsx       # Password reset with token
│   └── FirstTimeProfileSetupPage.tsx # Profile creation
├── components/common/
│   ├── ProtectedRoute.tsx          # Auth guard for app routes
│   └── PublicRoute.tsx             # Auth guard for auth routes
└── hooks/
    └── useAuth.ts                  # Authentication hook
```

## Routes

- `/welcome` - Welcome/entry page
- `/signup` - Account creation
- `/signin` - User login
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password (requires token parameter)
- `/profile-setup` - First-time profile setup

All main app routes (/, /create, /story/editor, etc.) are protected.

## Usage

### Check Authentication Status
```tsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, email } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/welcome" />;
  }
  
  return <div>Welcome {email}</div>;
}
```

### Login/Logout
```tsx
const { login, logout } = useAuth();

// After successful authentication
login('user@example.com');

// Sign out
logout();
```

## Storage

Authentication data is stored in localStorage:
- Key: `storyverse:auth`
- Data: `{ email, isAuthenticated, profileSetupComplete }`

Profile data is stored separately:
- Key: `storyverse:userProfile`
- Data: `{ displayName, bio, avatarDataUrl, updatedAt }`

## Future Enhancements

- Backend API integration for actual authentication
- OAuth integration (Google, etc.)
- Email verification
- Session management
- Refresh tokens
- Remember me functionality
- Two-factor authentication
