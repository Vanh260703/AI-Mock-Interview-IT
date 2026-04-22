import { useEffect, useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store.js';
import { userApi } from '../../api/user.api.js';
import StatsGrid from '../../components/dashboard/StatsGrid.jsx';
import ProgressChart from '../../components/dashboard/ProgressChart.jsx';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    Promise.all([userApi.getMyStats(), userApi.getMyProgress({ days: 90 })])
      .then(([s, p]) => { setStats(s.data.data); setProgress(p.data.data.progress); })
      .catch(() => toast.error('Không thể tải dữ liệu'));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>

      {/* User info card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <User size={15} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-700">{user?.username ?? 'Chưa đặt username'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-gray-400" />
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-gray-400" />
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user?.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
            }`}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Thống kê tổng quan</h2>
        <StatsGrid stats={stats} />
      </div>

      {/* Progress 90 days */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Tiến độ 90 ngày</h2>
        <ProgressChart data={progress} days={90} />
      </div>
    </div>
  );
};

export default ProfilePage;
