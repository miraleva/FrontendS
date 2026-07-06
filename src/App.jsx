import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import MainLayout from './layouts/MainLayout.jsx';

function ChatPagePlaceholder() {
  return <div className="p-6 text-text-secondary">Chat sayfasi (Gun 2de doldurulacak)</div>;
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
        <Route element={<MainLayout />}>
          <Route path="/chat" element={<ChatPagePlaceholder />} />
          <Route path="/documents" element={<DocumentPagePlaceholder />} />
          <Route path="/history" element={<HistoryPagePlaceholder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
