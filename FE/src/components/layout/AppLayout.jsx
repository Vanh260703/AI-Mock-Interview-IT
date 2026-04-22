import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  BrainCircuit, LayoutDashboard, Play, History,
  BookOpen, User, LogOut, Shield, Users,
  Search, UserPlus, Check, Loader2, Bell, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store.js';
import { useNotificationStore } from '../../store/notification.store.js';
import { authApi } from '../../api/auth.api.js';
import { socialApi } from '../../api/social.api.js';
import { TARGET_OPTIONS, CAREER_LEVEL_OPTIONS } from '../../lib/constants.js';

const NAV = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interview/setup', icon: Play,            label: 'Phỏng vấn mới' },
  { to: '/history',         icon: History,         label: 'Lịch sử' },
  { to: '/questions',       icon: BookOpen,        label: 'Ngân hàng câu hỏi' },
  { to: '/messages',        icon: MessageCircle,   label: 'Tin nhắn' },
  { to: '/community',       icon: Users,           label: 'Cộng đồng' },
  { to: '/profile',         icon: User,            label: 'Hồ sơ' },
];

// ─── FriendSearch dropdown ────────────────────────────────────────────────────
const FriendSearchBar = () => {
  const [q, setQ]             = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [relations, setRelations] = useState({});
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = async (val) => {
    if (val.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res  = await socialApi.searchUsers(val.trim());
      const data = res.data.data.slice(0, 6);
      setResults(data);
      const rel = {};
      data.forEach((u) => { rel[u._id] = { relation: u.relation, requestId: u.requestId }; });
      setRelations(rel);
      setOpen(true);
    } catch {
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSend = async (toId, e) => {
    e.stopPropagation();
    try {
      await socialApi.sendRequest(toId);
      setRelations((r) => ({ ...r, [toId]: { relation: 'sent' } }));
      toast.success('Đã gửi lời mời!');
    } catch (err) { toast.error(err.response?.data?.message ?? 'Gửi thất bại'); }
  };

  const handleAccept = async (toId, requestId, e) => {
    e.stopPropagation();
    try {
      await socialApi.acceptRequest(requestId);
      setRelations((r) => ({ ...r, [toId]: { relation: 'friend' } }));
      toast.success('Đã chấp nhận!');
    } catch (err) { toast.error(err.response?.data?.message ?? 'Thao tác thất bại'); }
  };

  const renderAction = (u) => {
    const rel = relations[u._id]?.relation ?? 'none';
    const rid = relations[u._id]?.requestId;
    if (rel === 'friend')   return <span className="text-xs text-green-600 font-medium">Bạn bè</span>;
    if (rel === 'sent')     return <span className="text-xs text-gray-400">Đã gửi</span>;
    if (rel === 'received') return (
      <button onClick={(e) => handleAccept(u._id, rid, e)}
        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
        Chấp nhận
      </button>
    );
    return (
      <button onClick={(e) => handleSend(u._id, e)}
        className="flex items-center gap-1 px-2 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg transition-colors">
        <UserPlus size={11} /> Kết bạn
      </button>
    );
  };

  return (
    <div ref={wrapRef} className="relative w-72">
      {/* Input */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tìm bạn bè..."
          className="w-full pl-8 pr-8 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
        />
        {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Không tìm thấy người dùng nào</p>
          ) : (
            <ul>
              {results.map((u) => {
                const target = TARGET_OPTIONS.find((t) => t.value === u.target);
                const level  = CAREER_LEVEL_OPTIONS.find((l) => l.value === u.careerLevel)?.label;
                const src    = u.avatar && !u.avatar.includes('vecteezy') ? u.avatar : null;
                return (
                  <li key={u._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                    {src ? (
                      <img src={src} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.email?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.username ?? u.email}</p>
                      <div className="flex gap-1">
                        {target && <span className="text-[11px] text-indigo-500">{target.emoji} {target.label}</span>}
                        {level  && <span className="text-[11px] text-violet-500">· {level}</span>}
                      </div>
                    </div>
                    {renderAction(u)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Notification Bell ────────────────────────────────────────────────────────
const NotificationBell = () => {
  const { notifications, markAllRead, markRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = notifications.filter((n) => !n.read).length;

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const iconFor = (type) => {
    if (type === 'friend_request')  return '👤';
    if (type === 'friend_accepted') return '🤝';
    if (type === 'chat_message')    return '💬';
    return '🔔';
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} className="text-gray-500" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Thông báo</span>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Chưa có thông báo nào</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.read ? 'bg-violet-50' : ''
                  }`}
                >
                  <span className="text-xl shrink-0 mt-0.5">{iconFor(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 mt-1.5" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
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
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <div className="pt-3 mt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500 px-3 mb-2 uppercase tracking-wider">Admin</p>
              <NavLink to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Shield size={18} /> Admin Users
              </NavLink>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user?.avatar && !user.avatar.includes('vecteezy') ? (
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
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
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-end gap-3 px-6 shrink-0 shadow-sm">
          <FriendSearchBar />
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
