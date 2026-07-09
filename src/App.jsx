import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import PastAppointments from './pages/PastAppointments.jsx';
import SearchChats from './pages/SearchChats.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Settings from './pages/Settings.jsx';

function DocumentPagePlaceholder() {
  return <div className="p-6 text-text-secondary">Dokuman yonetimi (FE2 tarafindan doldurulacak)</div>;
}
function HistoryPagePlaceholder() {
  return <div className="p-6 text-text-secondary">Gecmis operasyonlar (ileride doldurulacak)</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route element={<MainLayout />}>
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/chat/search" element={<SearchChats />} />
          <Route path="/appointments" element={<PastAppointments />} />
          <Route path="/documents" element={<DocumentPagePlaceholder />} />
          <Route path="/history" element={<HistoryPagePlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
