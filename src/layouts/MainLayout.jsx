import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
