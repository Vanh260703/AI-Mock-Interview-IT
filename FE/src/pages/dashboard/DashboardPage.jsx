import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, ChevronRight, Trophy, UserPlus, Search, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/user.api.js';
import { interviewApi } from '../../api/interview.api.js';
import { socialApi } from '../../api/social.api.js';
import { useAuthStore } from '../../store/auth.store.js';
import StatsGrid from '../../components/dashboard/StatsGrid.jsx';
import ProgressChart from '../../components/dashboard/ProgressChart.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { STATUS_MAP, LEVEL_MAP, ROLE_LABELS, TARGET_OPTIONS, CAREER_LEVEL_OPTIONS, scoreColor, formatDuration, formatDate } from '../../lib/constants.js';

// ─── Mini UserCard dùng trong Dashboard ───────────────────────────────────────
const MiniUserCard = ({ user, action }) => {
  const target = TARGET_OPTIONS.find((t) => t.value === user.target);
  const level  = CAREER_LEVEL_OPTIONS.find((l) => l.value === user.careerLevel)?.label;
  const src    = user.avatar && !user.avatar.includes('vecteezy') ? user.avatar : null;

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
      {src ? (
        <img src={src} alt="avatar" className="w-9 h-9 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {user.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{user.username ?? user.email}</p>
        <div className="flex gap-1 mt-0.5 flex-wrap">
          {target && <span className="text-[11px] text-indigo-500">{target.emoji} {target.label}</span>}
          {level  && <span className="text-[11px] text-violet-500">· {level}</span>}
        </div>
      </div>
      {action}
    </div>
  );
};

// ─── Widget: Gợi ý kết bạn ────────────────────────────────────────────────────
const SuggestionsWidget = () => {
  const [list, setSuggestions] = useState([]);
  const [sent, setSent]        = useState(new Set());
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    socialApi.getSuggestions()
      .then((res) => setSuggestions(res.data.data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (toId) => {
    try {
      await socialApi.sendRequest(toId);
      setSent((s) => new Set([...s, toId]));
      toast.success('Đã gửi lời mời!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gửi thất bại');
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">Gợi ý kết bạn</h2>
        <Link to="/community" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
          Xem tất cả <ChevronRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          Cập nhật <Link to="/profile" className="text-violet-600 hover:underline">target & level</Link> để nhận gợi ý
        </p>
      ) : (
        <div className="divide-y divide-gray-50">
          {list.map((u) => (
            <MiniUserCard key={u._id} user={u} action={
              sent.has(u._id) ? (
                <Check size={14} className="text-green-500 shrink-0" />
              ) : (
                <button onClick={() => handleSend(u._id)}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors">
                  <UserPlus size={12} /> Kết bạn
                </button>
              )
            } />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Widget: Tìm bạn bè ───────────────────────────────────────────────────────
const SearchFriendWidget = () => {
  const [q, setQ]             = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relations, setRelations] = useState({});
  const debounceRef = useRef(null);

  const doSearch = async (val) => {
    if (val.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await socialApi.searchUsers(val.trim());
      const data = res.data.data.slice(0, 5);
      setResults(data);
      const rel = {};
      data.forEach((u) => { rel[u._id] = { relation: u.relation, requestId: u.requestId }; });
      setRelations(rel);
    } catch {
    } finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSend = async (toId) => {
    try {
      await socialApi.sendRequest(toId);
      setRelations((r) => ({ ...r, [toId]: { relation: 'sent' } }));
      toast.success('Đã gửi lời mời!');
    } catch (err) { toast.error(err.response?.data?.message ?? 'Gửi thất bại'); }
  };

  const handleAccept = async (toId, requestId) => {
    try {
      await socialApi.acceptRequest(requestId);
      setRelations((r) => ({ ...r, [toId]: { relation: 'friend' } }));
      toast.success('Đã chấp nhận!');
    } catch (err) { toast.error(err.response?.data?.message ?? 'Thao tác thất bại'); }
  };

  const renderAction = (u) => {
    const rel = relations[u._id]?.relation ?? 'none';
    const rid = relations[u._id]?.requestId;
    if (rel === 'friend')   return <span className="text-xs text-green-600 font-medium shrink-0">Bạn bè</span>;
    if (rel === 'sent')     return <span className="text-xs text-gray-400 shrink-0">Đã gửi</span>;
    if (rel === 'received') return (
      <button onClick={() => handleAccept(u._id, rid)}
        className="shrink-0 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
        Chấp nhận
      </button>
    );
    return (
      <button onClick={() => handleSend(u._id)}
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors">
        <UserPlus size={12} /> Kết bạn
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">Tìm bạn bè</h2>
        <Link to="/community?tab=search" className="text-xs text-violet-600 hover:underline flex items-center gap-1">
          Tìm nâng cao <ChevronRight size={12} />
        </Link>
      </div>

      {/* Search input */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={handleChange}
          placeholder="Nhập email hoặc username..."
          className="w-full pl-8 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
        />
        {loading && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
      </div>

      {/* Results */}
      {q.length >= 2 && !loading && results.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Không tìm thấy người dùng nào</p>
      )}
      {results.length > 0 && (
        <div className="divide-y divide-gray-50">
          {results.map((u) => (
            <MiniUserCard key={u._id} user={u} action={renderAction(u)} />
          ))}
        </div>
      )}
      {q.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Nhập email hoặc username để tìm kiếm</p>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, progressRes, sessionsRes] = await Promise.all([
          userApi.getMyStats(),
          userApi.getMyProgress({ days: 30 }),
          interviewApi.getSessions({ limit: 5 }),
        ]);
        setStats(statsRes.data.data);
        setProgress(progressRes.data.data.progress);
        setRecentSessions(sessionsRes.data.data);
      } catch {
        toast.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Xin chào, {user?.username ?? user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Hôm nay bạn muốn luyện tập gì?</p>
        </div>
        <button
          onClick={() => navigate('/interview/setup')}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm shadow-violet-200"
        >
          <Play size={16} /> Phỏng vấn ngay
        </button>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Tiến độ 30 ngày</h2>
          <ProgressChart data={progress} />
        </div>

        {/* Favorite info */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Thông tin luyện tập</h2>
          <div className="space-y-3">
            {[
              { label: 'Role yêu thích', value: stats ? (ROLE_LABELS[stats.favoriteRole] ?? stats.favoriteRole ?? '—') : '…' },
              { label: 'Level hay luyện', value: stats ? (LEVEL_MAP[stats.favoriteLevel]?.label ?? stats.favoriteLevel ?? '—') : '…' },
              { label: 'Tỉ lệ hoàn thành', value: stats ? `${stats.completionRate ?? 0}%` : '…' },
              { label: 'Tổng thời gian', value: stats ? formatDuration(stats.totalDuration) : '…' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social — 2 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SuggestionsWidget />
        <SearchFriendWidget />
      </div>

      {/* Recent sessions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Sessions gần đây</h2>
          <Link to="/history" className="text-sm text-violet-600 hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Chưa có session nào. <Link to="/interview/setup" className="text-violet-600 hover:underline">Bắt đầu ngay!</Link></p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentSessions.map((s) => (
              <Link key={s._id} to={`/history/${s._id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={STATUS_MAP[s.status]?.color ?? 'bg-gray-100 text-gray-600'}>
                        {STATUS_MAP[s.status]?.label ?? s.status}
                      </Badge>
                      {s.settings?.role && <Badge className="bg-indigo-50 text-indigo-600">{s.settings.role}</Badge>}
                      {s.settings?.level && (
                        <Badge className={LEVEL_MAP[s.settings.level]?.color ?? 'bg-gray-100 text-gray-600'}>
                          {LEVEL_MAP[s.settings.level]?.label ?? s.settings.level}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(s.completedAt ?? s.createdAt)} · {s.settings?.questionCount ?? 0} câu · {formatDuration(s.duration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {s.overallScore != null && (
                    <span className={`text-lg font-bold tabular-nums ${scoreColor(s.overallScore)}`}>
                      {s.overallScore}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
