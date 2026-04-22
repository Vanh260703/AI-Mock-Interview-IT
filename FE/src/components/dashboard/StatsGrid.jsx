import { Trophy, Target, Zap, Clock, CheckCircle, Star } from 'lucide-react';
import { scoreColor, formatDuration } from '../../lib/constants.js';

const StatCard = ({ icon: Icon, label, value, sub, iconColor = 'text-violet-500', bg = 'bg-violet-50' }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const StatsGrid = ({ stats }) => {
  if (!stats) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="h-7 bg-gray-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={Target}
        label="Tổng sessions"
        value={stats.totalSessions}
        sub={`${stats.completionRate ?? 0}% hoàn thành`}
        iconColor="text-violet-500"
        bg="bg-violet-50"
      />
      <StatCard
        icon={Star}
        label="Điểm trung bình"
        value={stats.avgScore != null ? `${stats.avgScore}` : '—'}
        sub={stats.bestScore != null ? `Cao nhất: ${stats.bestScore}` : 'Chưa có dữ liệu'}
        iconColor="text-yellow-500"
        bg="bg-yellow-50"
      />
      <StatCard
        icon={Zap}
        label="Streak"
        value={`${stats.streak ?? 0} ngày`}
        sub="Liên tiếp"
        iconColor="text-orange-500"
        bg="bg-orange-50"
      />
      <StatCard
        icon={Clock}
        label="Tổng thời gian"
        value={formatDuration(stats.totalDuration)}
        sub={`${stats.totalAnswers ?? 0} câu đã trả lời`}
        iconColor="text-blue-500"
        bg="bg-blue-50"
      />
    </div>
  );
};

export default StatsGrid;
