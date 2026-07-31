import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Dumbbell, Apple, TrendingUp,
  Camera, FileText, Calendar, BarChart3, User, Settings, LogOut,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/coach', icon: MessageSquare, label: 'AI Coach' },
  { to: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { to: '/nutrition', icon: Apple, label: 'Nutrition' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/photos', icon: Camera, label: 'Photos & Form' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-fitman-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-fitman-border lg:bg-fitman-navy">
        <div className="p-6">
          <Logo />
          <p className="mt-1 text-xs text-fitman-muted">Your AI Fitness Coach</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-fitman-accent/20 text-fitman-accent' : 'text-fitman-muted hover:bg-fitman-card hover:text-white'
              )}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-fitman-border p-4">
          <p className="truncate text-sm font-medium text-white">{user?.display_name || user?.username}</p>
          <button onClick={handleLogout} className="mt-2 flex items-center gap-2 text-sm text-fitman-muted hover:text-red-400">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-fitman-border bg-fitman-navy lg:hidden">
        {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs',
              isActive ? 'text-fitman-accent' : 'text-fitman-muted'
            )}
          >
            <Icon size={20} />
            <span>{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
