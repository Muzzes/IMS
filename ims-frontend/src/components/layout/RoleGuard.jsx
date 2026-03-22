import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleGuard({ allowed, children }) {
  const { role } = useAuth();

  if (!allowed.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
