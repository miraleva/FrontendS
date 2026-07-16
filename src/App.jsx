import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import PastAppointments from './pages/PastAppointments.jsx';
import SearchChats from './pages/SearchChats.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Settings from './pages/Settings.jsx';
import Reservation from './pages/ReservationPage.jsx';
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import ForgotPasswordPage from './pages/ForgotPassword.jsx';
import ResetPasswordPage from './pages/ResetPassword.jsx';


import LanguageSelector from './components/LanguageSelector.jsx';

function DocumentPagePlaceholder() {
  return <div className="p-6 text-text-secondary">Dokuman yonetimi (FE2 tarafindan doldurulacak)</div>;
}
function HistoryPagePlaceholder() {
  return <div className="p-6 text-text-secondary">Gecmis operasyonlar (ileride doldurulacak)</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Tüm ekranları kaplayan relative bir sarmalayıcı ekliyoruz.
        Böylece dil seçici absolute CSS ile hep sağ üstte sabit kalacak.
      */}
      <div className="relative min-h-screen w-full">
        <div className="absolute top-4 right-4 z-[9999]">
          <LanguageSelector />
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/reservation" element={<Reservation />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
          </Route>

          {/* İhtiyacınız yoksa /language rotasını kaldırabilirsiniz, çünkü artık her yerde global */}
          {/* <Route path="/language" element={<LanguageSelector />} />*/}

          <Route element={<MainLayout />}>
            <Route path="/chat" element={<ChatbotPage />} />
            <Route path="/chat/search" element={<SearchChats />} />
            <Route path="/appointments" element={<PastAppointments />} />
            <Route path="/documents" element={<DocumentPagePlaceholder />} />
            <Route path="/history" element={<HistoryPagePlaceholder />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reservation" element={<Reservation />} />
            {/* Şifremi Unuttum ve Sıfırlama Sayfalarının Rotaları */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Routes>
      </div >
    </BrowserRouter >
  );
}
