import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import UserAvatar from './UserAvatar';

const DashboardLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-surface-200/60 bg-white/80 backdrop-blur-lg px-4 lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-100 text-surface-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-surface-800 leading-tight">{currentUser.name}</p>
              <p className="text-[11px] text-surface-400 capitalize">{currentUser.role} · {currentUser.department}</p>
            </div>
            <UserAvatar user={currentUser} size="h-9 w-9" />
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
