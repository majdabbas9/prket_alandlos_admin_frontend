import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authApi } from '@/api';

export default function ProtectedRoute() {
  const token = localStorage.getItem('admin_token');
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token || token === 'undefined' || token === 'null') {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        await authApi.validate(token);
        setIsValid(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('admin_token');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-walnut-800 border-t-transparent" />
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
