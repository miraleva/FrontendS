import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import MainLayout from './layouts/MainLayout.jsx';

function ChatPagePlaceholder() {
  return <ChatbotPage />;
}
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
        <Route element={<MainLayout />}>
          <Route path="/chat" element={<ChatbotPage />} />
          <Route path="/documents" element={<DocumentPagePlaceholder />} />
          <Route path="/history" element={<HistoryPagePlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
