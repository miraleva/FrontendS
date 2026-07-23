import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

export default function MainLayout() {
  const location = useLocation();
  const hideGlobalLayout = location.pathname.startsWith('/chat') || location.pathname === '/past-reservations' || location.pathname === '/profile' || location.pathname === '/settings' || location.pathname === '/reservation';

  return (
    <div className="min-h-screen flex bg-bg dark:bg-slate-950">
      {!hideGlobalLayout && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        {!hideGlobalLayout && <Header />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
