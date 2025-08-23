import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import { useUserCompleteInformation } from '../../features/users/useUserCompleteInformation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { userCompleteInformation } = useUserCompleteInformation();
  const location = useLocation();


  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }




  return <>{children}</>;
};

export default ProtectedRoute;