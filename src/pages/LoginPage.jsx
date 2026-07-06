import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Kullanici adi bos olamaz.');
      return;
    }
    localStorage.setItem('userId', userId.trim());
    navigate('/chat');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-card shadow-sm p-6">
        <h1 className="text-2xl font-display font-semibold text-secondary mb-1">
          Turizm AI Chatbot
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Operasyon asistanina giris yapin
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-text-primary mb-1">
              Kullanici adi
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="orn. operasyon.uzmani"
              className="w-full border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            className="mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-btn font-medium text-sm transition-colors"
          >
            Giris Yap
          </button>
        </form>
      </div>
    </div>
  );
}
