import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewApi } from '../../api/interview.api.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { STATUS_MAP, LEVEL_MAP, scoreColor, formatDate, formatDuration } from '../../lib/constants.js';

const STATUSES = [
  { v: '', l: 'Tất cả' },
  { v: 'completed', l: 'Hoàn thành' },
  { v: 'in_progress', l: 'Đang làm' },
  { v: 'abandoned', l: 'Bỏ dở' },
];

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await interviewApi.getSessions({ page, limit: 10, ...(status && { status }) });
      setSessions(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Không thể tải lịch sử');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, page]);

  const handleStatusChange = (s) => { setStatus(s); setPage(1); };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử phỏng vấn</h1>
        <Link to="/interview/setup"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors">
          + Phỏng vấn mới
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400" />
        {STATUSES.map(({ v, l }) => (
          <button key={v} onClick={() => handleStatusChange(v)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === v ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-8 w-12 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={History}
            title="Chưa có phỏng vấn nào"
            description="Bắt đầu luyện tập để xem lịch sử tại đây"
            action={<Link to="/interview/setup" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm">Phỏng vấn ngay</Link>}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {sessions.map((s) => (
              <Link key={s._id} to={`/history/${s._id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={STATUS_MAP[s.status]?.color ?? 'bg-gray-100 text-gray-600'}>
                      {STATUS_MAP[s.status]?.label ?? s.status}
                    </Badge>
                    {s.settings?.role && <Badge className="bg-indigo-50 text-indigo-600">{s.settings.role}</Badge>}
                    {s.settings?.level && (
                      <Badge className={LEVEL_MAP[s.settings.level]?.color ?? 'bg-gray-100 text-gray-600'}>
                        {LEVEL_MAP[s.settings.level]?.label}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400 capitalize">{s.type}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatDate(s.completedAt ?? s.createdAt)}
                    {s.settings?.questionCount && ` · ${s.settings.questionCount} câu`}
                    {s.duration > 0 && ` · ${formatDuration(s.duration)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.overallScore != null && (
                    <span className={`text-xl font-bold tabular-nums ${scoreColor(s.overallScore)}`}>
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-gray-300">
            ← Trước
          </button>
          <span className="text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-gray-300">
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
