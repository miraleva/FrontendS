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
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      {/* Background Video Container */}
      <div className="fixed inset-0 w-screen h-screen -z-20">
        <video
          src="videos/background.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark Overlay */}
      <div className="fixed inset-0 w-screen h-screen bg-black/40 -z-10" />

      {/* Glassmorphism Login Card */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-display font-semibold text-white mb-2 text-center">
          Turizm AI Chatbot
        </h1>
        <p className="text-sm text-white/80 mb-8 text-center">
          Operasyon asistanina giris yapin
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-white mb-1.5">
              Kullanici adi
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="orn. operasyon.uzmani"
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white/10 transition-all"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg hover:shadow-primary/30"
          >
            Giris Yap
          </button>
        </form>
      </div>
    </div>
  );
}
