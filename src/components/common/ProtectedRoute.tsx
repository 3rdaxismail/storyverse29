/**
 * ProtectedRoute - Route guard component
 * Enforces authentication and profile completion rules using Firebase Auth
 * NEVER use localStorage for auth state - Firebase is single source of truth
 */
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import SplashScreen from './SplashScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfileComplete?: boolean;
}

export default function ProtectedRoute({ children, requireProfileComplete = true }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return <SplashScreen message="Loading your stories..." />;
  }

  // Not authenticated → redirect to welcome
  if (!user) {
    return <Navigate to="/auth/welcome" replace />;
  }

  // Authenticated but profile not completed → redirect to profile setup
  if (requireProfileComplete && userProfile && !userProfile.profileCompleted) {
    return <Navigate to="/auth/profile-setup" replace />;
  }

  // Authenticated and (profile completed or not required) → allow access
  return <>{children}</>;
}
