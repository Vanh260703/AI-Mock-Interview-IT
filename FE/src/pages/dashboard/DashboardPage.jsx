import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, ChevronRight, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../api/user.api.js';
import { interviewApi } from '../../api/interview.api.js';
import { useAuthStore } from '../../store/auth.store.js';
import StatsGrid from '../../components/dashboard/StatsGrid.jsx';
import ProgressChart from '../../components/dashboard/ProgressChart.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { STATUS_MAP, LEVEL_MAP, ROLE_LABELS, scoreColor, formatDuration, formatDate } from '../../lib/constants.js';

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
