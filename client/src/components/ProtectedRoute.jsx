import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, validateToken } from '../context/AuthContext';
import { PageLoader } from './LoadingSpinner';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  const token = localStorage.getItem('ims_token');
  const decoded = validateToken(token);

  // Check 1: React auth state
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Check 2: Valid token in storage
  if (!decoded) {
    logout();
    return <PageLoader />;
  }

  // Role check: derive role from decoded token, NOT React state which can be tampered
  if (roles && !roles.includes(decoded.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;
