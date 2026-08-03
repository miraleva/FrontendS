import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import PastAppointments from "./pages/PastAppointments.jsx";
import SearchChats from "./pages/SearchChats.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import Settings from "./pages/Settings.jsx";
import Reservation from "./pages/ReservationPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";

import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";

import Dashboard from "./pages/admin/Dashboard.jsx";

import Reservations from "./pages/admin/Reservations.jsx";
import Users from "./pages/admin/Users.jsx";
import ChatLogs from "./pages/admin/ChatLogs.jsx";
import SystemMetrics from "./pages/admin/SystemMetrics.jsx";
import Analytics from "./pages/admin/Analytics.jsx";
import Forecaster from "./pages/admin/Forecaster.jsx";
import TourVisioErrors from "./pages/admin/TourVisioErrors.jsx";

import { ThemeProvider } from "./components/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./components/AuthContext.jsx";
import { FavoritesProvider } from "./components/FavoritesContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Root redirect handler: if already authenticated redirect to /chat, else render WelcomePage
function RootRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }
  return <WelcomePage />;
}

// ==========================================
// GEÇİCİ BİLEŞENLER (PLACEHOLDERS)
// ==========================================
function DocumentPagePlaceholder() {
  return (
    <div className="p-6 text-text-secondary">
      Dokuman yonetimi (FE2 tarafindan doldurulacak)
    </div>
  );
}

function HistoryPagePlaceholder() {
  return (
    <div className="p-6 text-text-secondary">
      Gecmis operasyonlar (ileride doldurulacak)
    </div>
  );
}

// ==========================================
// ANA UYGULAMA BİLEŞENİ
// ==========================================
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <BrowserRouter>
              {/* Dark mode ve açık tema için global sarmalayıcı */}
            <div className="relative min-h-screen w-full bg-white text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50">
              <Routes>
                {/* Ana yönlendirme */}
                <Route path="/" element={<RootRoute />} />
                <Route path="/welcome" element={<WelcomePage />} />

                {/* Layout dışında açılması gereken sayfalar */}

                {/* Layout dışında açılması gereken sayfalar */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/reset-password"
                  element={<ResetPasswordPage />}
                />

                {/* ADMIN ROTALARI */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route
                    path="reservations"
                    element={<Reservations />}
                  />
                  <Route path="users" element={<Users />} />
                  <Route path="chats" element={<ChatLogs />} />
                  <Route path="metrics" element={<SystemMetrics />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="forecaster" element={<Forecaster />} />
                  <Route path="errors" element={<TourVisioErrors />} />
                </Route>

                {/* KULLANICI & GUEST ROTALARI (ProtectedRoute) */}
                <Route element={<ProtectedRoute allowedTypes={['authenticated', 'guest']} />}>
                  <Route element={<MainLayout />}>
                    <Route path="/chat" element={<ChatbotPage />} />
                    <Route
                      path="/chat/search"
                      element={<SearchChats />}
                    />
                    <Route
                      path="/favorites"
                      element={<FavoritesPage />}
                    />
                    <Route
                      path="/documents"
                      element={<DocumentPagePlaceholder />}
                    />
                    <Route
                      path="/history"
                      element={<HistoryPagePlaceholder />}
                    />
                    <Route
                      path="/reservation"
                      element={<Reservation />}
                    />
                  </Route>
                </Route>

                {/* SADECE GİRİŞ YAPMIŞ KULLANICI ROTALARI */}
                <Route element={<ProtectedRoute allowedTypes={['authenticated']} redirectGuestTo="/chat" />}>
                  <Route element={<MainLayout />}>
                    <Route
                      path="/past-reservations"
                      element={<PastAppointments />}
                    />
                    <Route
                      path="/profile"
                      element={<ProfilePage />}
                    />
                    <Route
                      path="/settings"
                      element={<Settings />}
                    />
                  </Route>
                </Route>
              </Routes>
            </div>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
  );
}