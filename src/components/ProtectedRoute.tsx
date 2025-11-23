import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <span className="sr-only">جاري التحميل...</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
