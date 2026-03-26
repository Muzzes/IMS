import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  // Check both user state AND token exists in localStorage
  const hasToken = !!localStorage.getItem('ims_token');
  if (!user || !hasToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Role check: redirect to /403 if user doesn't have the required role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;
