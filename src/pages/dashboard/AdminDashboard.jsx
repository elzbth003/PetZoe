import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Legacy AdminDashboard wrapper that redirects to the primary Admin Layout (/dashboard/admin).
 */
export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard/admin', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  );
}
