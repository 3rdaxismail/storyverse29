/**
 * ProtectedRoute - Route guard component
 * Enforces authentication and profile completion rules
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileComplete?: boolean;
}

export default function ProtectedRoute({ children, requireProfileComplete = false }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}>
        Loading...
      </div>
    );
  }

  // Not authenticated → redirect to welcome
  if (!user) {
    return <Navigate to="/auth/welcome" replace />;
  }

  // Authenticated but profile not completed → redirect to profile setup
  if (userProfile && !userProfile.profileCompleted && requireProfileComplete) {
    return <Navigate to="/auth/profile-setup" replace />;
  }

  // Authenticated and profile completed → allow access
  return <>{children}</>;
}
