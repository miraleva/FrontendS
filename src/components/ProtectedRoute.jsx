import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ allowedTypes = ['authenticated', 'guest'] }) {
  const { isGuest, isAuthenticated, token } = useAuth();

  const hasGuestSession = localStorage.getItem('isGuest') === 'true';
  const hasToken = !!(token || (localStorage.getItem('token') && localStorage.getItem('token') !== 'null'));

  const isAllowed =
    (allowedTypes.includes('authenticated') && (isAuthenticated || hasToken)) ||
    (allowedTypes.includes('guest') && (isGuest || hasGuestSession));

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
