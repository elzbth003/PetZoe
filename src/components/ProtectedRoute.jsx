import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary-600 h-10 w-10" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if role is unauthorized for this route
    switch (user.role) {
      case 'Pet Owner':
        return <Navigate to="/dashboard/owner" replace />;
      case 'Veterinarian':
        return <Navigate to="/dashboard/vet" replace />;
      case 'Shelter Manager':
        return <Navigate to="/dashboard/shelter" replace />;
      case 'Marketplace Seller':
        return <Navigate to="/dashboard/seller" replace />;
      case 'Admin':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
