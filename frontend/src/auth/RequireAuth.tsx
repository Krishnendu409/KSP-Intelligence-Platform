import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { token, user, hydrateUser, isHydrating } = useAuthStore();

  useEffect(() => {
    if (token && !user) hydrateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!user && isHydrating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-tactical-950 text-tactical-400 font-mono text-sm">
        Verifying session...
      </div>
    );
  }

  return <>{children}</>;
}
