import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, LayoutDashboard, Play, History,
  BookOpen, User, LogOut, ChevronRight, Shield,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store.js';
import { authApi } from '../../api/auth.api.js';
import toast from 'react-hot-toast';
import { TARGET_OPTIONS } from '../../lib/constants.js';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interview/setup', icon: Play, label: 'Phỏng vấn mới' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/questions', icon: BookOpen, label: 'Ngân hàng câu hỏi' },
  { to: '/profile', icon: User, label: 'Hồ sơ' },
];

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    logout();
    navigate('/login');
    toast.success('Đã đăng xuất');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-700">
          <BrainCircuit className="w-7 h-7 text-violet-400" />
          <span className="font-bold text-white text-lg leading-tight">AI Mock<br/>Interview</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <div className="pt-3 mt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500 px-3 mb-2 uppercase tracking-wider">Admin</p>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Shield size={18} />Admin Users
              </NavLink>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user?.avatar && !user.avatar.includes('vecteezy') ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{user?.username ?? user?.email}</p>
              {(() => {
                const t = TARGET_OPTIONS.find((o) => o.value === user?.target);
                return t
                  ? <p className="text-slate-400 text-xs truncate">{t.emoji} {t.label}</p>
                  : <p className="text-slate-500 text-xs truncate">{user?.email}</p>;
              })()}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
