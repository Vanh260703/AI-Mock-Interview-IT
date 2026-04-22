import { useState, useEffect, useRef } from 'react';
import { Users, Search, UserPlus, Bell, Check, X, UserMinus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { socialApi } from '../../api/social.api.js';
import { TARGET_OPTIONS, CAREER_LEVEL_OPTIONS } from '../../lib/constants.js';

// ─── Helper ────────────────────────────────────────────────────────────────────
const getTargetInfo  = (v) => TARGET_OPTIONS.find((t) => t.value === v);
const getLevelLabel  = (v) => CAREER_LEVEL_OPTIONS.find((l) => l.value === v)?.label;

const avatarSrc = (user) =>
  user?.avatar && !user.avatar.includes('vecteezy') ? user.avatar : null;

// ─── UserCard ──────────────────────────────────────────────────────────────────
const UserCard = ({ user, action }) => {
  const target = getTargetInfo(user.target);
  const level  = getLevelLabel(user.careerLevel);
  const src    = avatarSrc(user);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Avatar */}
      {src ? (
        <img src={src} alt="avatar" className="w-12 h-12 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {user.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {user.username ?? user.email}
        </p>
        <p className="text-xs text-gray-400 truncate">{user.email}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {target && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              {target.emoji} {target.label}
            </span>
          )}
          {level && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 font-medium">
              {level}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="shrink-0">{action}</div>
    </div>
  );
};

// ─── Tab: Gợi ý ────────────────────────────────────────────────────────────────
const SuggestionsTab = () => {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [sent, setSent]     = useState(new Set());

  useEffect(() => {
    socialApi.getSuggestions()
      .then((res) => setList(res.data.data))
      .catch(() => toast.error('Không thể tải gợi ý'))
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (toId) => {
    try {
      await socialApi.sendRequest(toId);
      setSent((s) => new Set([...s, toId]));
      toast.success('Đã gửi lời mời kết bạn!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gửi thất bại');
    }
  };

  if (loading) return <Loader className="mt-10" />;
  if (!list.length) return <Empty text="Chưa có gợi ý nào. Hãy cập nhật target và level trong hồ sơ!" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {list.map((u) => (
        <UserCard key={u._id} user={u} action={
          sent.has(u._id) ? (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Check size={13} className="text-green-500" /> Đã gửi
            </span>
          ) : (
            <button onClick={() => handleSend(u._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors">
              <UserPlus size={13} /> Kết bạn
            </button>
          )
        } />
      ))}
    </div>
  );
};

// ─── Tab: Tìm kiếm ─────────────────────────────────────────────────────────────
const SearchTab = () => {
  const [q, setQ]           = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relations, setRelations] = useState({});   // userId → { relation, requestId }
  const debounceRef = useRef(null);

  const doSearch = async (val) => {
    if (val.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await socialApi.searchUsers(val.trim());
      const data = res.data.data;
      setResults(data);
      const rel = {};
      data.forEach((u) => { rel[u._id] = { relation: u.relation, requestId: u.requestId }; });
      setRelations(rel);
    } catch {
      toast.error('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
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
      setRelations((r) => ({ ...r, [toId]: { relation: 'sent', requestId: null } }));
      toast.success('Đã gửi lời mời kết bạn!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gửi thất bại');
    }
  };

  const handleAccept = async (toId, requestId) => {
    try {
      await socialApi.acceptRequest(requestId);
      setRelations((r) => ({ ...r, [toId]: { relation: 'friend', requestId } }));
      toast.success('Đã chấp nhận lời mời!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Thao tác thất bại');
    }
  };

  const renderAction = (u) => {
    const rel = relations[u._id]?.relation ?? 'none';
    const rid = relations[u._id]?.requestId;

    if (rel === 'friend') return (
      <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
        <Check size={13} /> Bạn bè
      </span>
    );
    if (rel === 'sent') return (
      <span className="text-xs text-gray-400 flex items-center gap-1">
        <Check size={13} className="text-violet-400" /> Đã gửi
      </span>
    );
    if (rel === 'received') return (
      <button onClick={() => handleAccept(u._id, rid)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
        <Check size={13} /> Chấp nhận
      </button>
    );
    return (
      <button onClick={() => handleSend(u._id)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors">
        <UserPlus size={13} /> Kết bạn
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={handleChange}
          placeholder="Nhập email hoặc username..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
      </div>

      {q.length >= 2 && !loading && !results.length && (
        <Empty text="Không tìm thấy người dùng nào" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((u) => (
          <UserCard key={u._id} user={u} action={renderAction(u)} />
        ))}
      </div>
    </div>
  );
};

// ─── Tab: Lời mời đến ──────────────────────────────────────────────────────────
const RequestsTab = ({ onAccepted }) => {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialApi.getIncoming()
      .then((res) => setList(res.data.data))
      .catch(() => toast.error('Không thể tải lời mời'))
      .finally(() => setLoading(false));
  }, []);

  const handle = async (id, action) => {
    try {
      if (action === 'accept') {
        await socialApi.acceptRequest(id);
        toast.success('Đã chấp nhận!');
        onAccepted();
      } else {
        await socialApi.rejectRequest(id);
        toast.success('Đã từ chối');
      }
      setList((l) => l.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Thao tác thất bại');
    }
  };

  if (loading) return <Loader className="mt-10" />;
  if (!list.length) return <Empty text="Không có lời mời nào" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {list.map((r) => (
        <UserCard key={r._id} user={r.from} action={
          <div className="flex gap-2">
            <button onClick={() => handle(r._id, 'accept')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Check size={13} /> Chấp nhận
            </button>
            <button onClick={() => handle(r._id, 'reject')}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors">
              <X size={13} /> Từ chối
            </button>
          </div>
        } />
      ))}
    </div>
  );
};

// ─── Tab: Bạn bè ───────────────────────────────────────────────────────────────
const FriendsTab = ({ refresh }) => {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    socialApi.getFriends()
      .then((res) => setList(res.data.data))
      .catch(() => toast.error('Không thể tải danh sách bạn bè'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [refresh]);

  const handleUnfriend = async (userId) => {
    try {
      await socialApi.unfriend(userId);
      setList((l) => l.filter((u) => u._id !== userId));
      toast.success('Đã huỷ kết bạn');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  if (loading) return <Loader className="mt-10" />;
  if (!list.length) return <Empty text="Chưa có bạn bè nào. Hãy tìm kiếm hoặc xem gợi ý!" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {list.map((u) => (
        <UserCard key={u._id} user={u} action={
          <button onClick={() => handleUnfriend(u._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-xs font-medium rounded-lg transition-colors">
            <UserMinus size={13} /> Huỷ kết bạn
          </button>
        } />
      ))}
    </div>
  );
};

// ─── Shared UI ─────────────────────────────────────────────────────────────────
const Loader = ({ className = '' }) => (
  <div className={`flex justify-center ${className}`}>
    <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
  </div>
);

const Empty = ({ text }) => (
  <div className="text-center py-16 text-gray-400 text-sm">{text}</div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'suggestions', label: 'Gợi ý',       icon: UserPlus },
  { key: 'search',      label: 'Tìm kiếm',    icon: Search },
  { key: 'requests',    label: 'Lời mời',      icon: Bell },
  { key: 'friends',     label: 'Bạn bè',       icon: Users },
];

const FriendsPage = () => {
  const [tab, setTab]         = useState('suggestions');
  const [friendRefresh, setFriendRefresh] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);

  useEffect(() => {
    socialApi.getIncoming()
      .then((res) => setIncomingCount(res.data.data.length))
      .catch(() => {});
  }, []);

  const handleAccepted = () => {
    setIncomingCount((c) => Math.max(0, c - 1));
    setFriendRefresh((n) => n + 1);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cộng đồng</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              tab === key
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={15} />
            {label}
            {key === 'requests' && incomingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {incomingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'suggestions' && <SuggestionsTab />}
      {tab === 'search'      && <SearchTab />}
      {tab === 'requests'    && <RequestsTab onAccepted={handleAccepted} />}
      {tab === 'friends'     && <FriendsTab refresh={friendRefresh} />}
    </div>
  );
};

export default FriendsPage;
