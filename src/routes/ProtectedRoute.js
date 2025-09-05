import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const location = useLocation();
  const authUser = localStorage.getItem('authUser');
  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;


