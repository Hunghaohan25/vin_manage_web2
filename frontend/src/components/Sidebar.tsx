import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Users,
  ClipboardCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  UsersRound,
  Settings,
} from 'lucide-react';

const employeeLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/leave', label: 'Leave Request', icon: FileText },
];

const managerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'User Management', icon: UsersRound },
  { to: '/team-attendance', label: 'Team Attendance', icon: Users },
  { to: '/leave-approval', label: 'Leave Approval', icon: ClipboardCheck },
];

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'User Management', icon: UsersRound },
  { to: '/team-attendance', label: 'Team Attendance', icon: Users },
  { to: '/leave-approval', label: 'Leave Approval', icon: ClipboardCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return null;

  const links = currentUser.role === 'admin'
    ? adminLinks
    : currentUser.role === 'manager'
      ? managerLinks
      : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex flex-col
        bg-surface-900 text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-18' : 'w-64'}
      `}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-surface-700/50">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
          <Building2 size={20} />
        </div>
        {!collapsed && (
          <div className="animate-slide-in overflow-hidden">
            <p className="text-sm font-bold tracking-wide">VinHRM</p>
            <p className="text-[10px] text-surface-400 uppercase tracking-widest">Team Manager</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              }
              ${collapsed ? 'justify-center' : ''}`
            }
          >
            <link.icon size={20} className="shrink-0" />
            {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-surface-700/50 p-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <UserAvatar user={currentUser} size="h-9 w-9" />
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-slide-in">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-[11px] text-surface-400 capitalize">{currentUser.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-surface-700 text-surface-300 hover:bg-primary-600 hover:text-white shadow-md transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;
