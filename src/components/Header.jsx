import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Header() {
  const [isUp, setIsUp] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/api/health');
        setIsUp(true);
      } catch (err) {
        setIsUp(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-surface dark:bg-slate-900 border-b border-border dark:border-slate-800 flex items-center justify-between px-6">
      <span className="text-sm font-medium text-text-secondary dark:text-slate-400">Operasyon Asistani</span>
      <div data-slot="header-actions" className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isUp ? 'bg-accent' : 'bg-rose-500 animate-pulse'}`} />
        <span className="text-xs text-text-secondary dark:text-slate-400">
          {isUp ? 'Servisler aktif' : 'Servisler devre dışı'}
        </span>
      </div>
    </header>
  );
}
