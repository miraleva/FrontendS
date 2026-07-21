import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * allowedTypes: ['authenticated', 'guest'] → her ikisi de girebilir
 * allowedTypes: ['authenticated']            → sadece giriş yapmış kullanıcılar
 * redirectGuestTo: string                    → misafir erişiminde özel yönlendirme
 */
export default function ProtectedRoute({
  allowedTypes = ['authenticated', 'guest'],
  redirectGuestTo = '/login',
}) {
  const { isGuest, isAuthenticated, token } = useAuth();

  const hasGuestSession = localStorage.getItem('isGuest') === 'true';
  const hasToken = !!(token || (localStorage.getItem('token') && localStorage.getItem('token') !== 'null'));

  const effectiveIsGuest = isGuest || hasGuestSession;
  const effectiveIsAuth  = isAuthenticated || hasToken;

  // Misafir bu rotaya giremez → özel yönlendirme
  if (effectiveIsGuest && !allowedTypes.includes('guest')) {
    return <Navigate to={redirectGuestTo} replace />;
  }

  // Giriş yapmamış normal kullanıcı
  const isAllowed =
    (allowedTypes.includes('authenticated') && effectiveIsAuth) ||
    (allowedTypes.includes('guest') && effectiveIsGuest);

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
