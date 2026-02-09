/**
 * PublicRoute - Auth page route guard
 * Redirects authenticated users to home
 * Uses Firebase Auth as single source of truth
 */
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import SplashScreen from './SplashScreen';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, userProfile, loading } = useAuth();
  
  // Show loading state while checking auth
  if (loading) {
    return <SplashScreen />;
  }

  // If user is authenticated but profile is still loading, wait
  if (user && !userProfile) {
    return <SplashScreen />;
  }

  // If authenticated and profile complete → redirect to home
  if (user && userProfile && userProfile.profileCompleted) {
    return <Navigate to="/home" replace />;
  }

  // If authenticated but profile incomplete → redirect to setup
  if (user && userProfile && !userProfile.profileCompleted) {
    return <Navigate to="/auth/profile-setup" replace />;
  }

  // Not authenticated → allow access to auth pages
  return <>{children}</>;
}
