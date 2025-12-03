import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'ROLE_PARTICIPANT' | 'ROLE_ORGANIZER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { isAuthenticated, authData, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific role is required, check if user has it
  if (requireRole && authData) {
    const hasRole = authData.roles.some(role => role === requireRole);

    if (!hasRole) {
      // If user needs ROLE_ORGANIZER but doesn't have it, redirect to become organizer page
      if (requireRole === 'ROLE_ORGANIZER') {
        return <Navigate to="/organizer/profile" replace />;
      }

      // Otherwise redirect to home
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;

