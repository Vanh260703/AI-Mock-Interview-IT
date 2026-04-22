import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import { Cpu, HardDrive, Clock } from 'lucide-react';

const AdminSystemPage = () => {
  const [sys, setSys] = useState(null);

  useEffect(() => {
    api.get('/admin/system')
      .then((res) => setSys(res.data))
      .catch(() => toast.error('Không thể tải thông tin hệ thống'));
  }, []);

  if (!sys) return <div className="p-6 animate-pulse"><div className="h-8 bg-gray-100 rounded w-48 mb-6" /></div>;

  const memPct = Math.round((sys.memory.usedBytes / sys.memory.totalBytes) * 100);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Thông tin hệ thống</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3"><HardDrive size={16} className="text-blue-500" /><span className="text-sm font-semibold text-gray-700">RAM</span></div>
          <p className="text-2xl font-bold text-gray-900">{memPct}%</p>
          <p className="text-xs text-gray-400 mt-1">
            {Math.round(sys.memory.usedBytes / 1024 / 1024)} MB / {Math.round(sys.memory.totalBytes / 1024 / 1024)} MB
          </p>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${memPct}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3"><Cpu size={16} className="text-violet-500" /><span className="text-sm font-semibold text-gray-700">CPU</span></div>
          <p className="text-2xl font-bold text-gray-900">{sys.cpu.cores} cores</p>
          <p className="text-xs text-gray-400 mt-1">{sys.cpu.model?.slice(0, 30)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3"><Clock size={16} className="text-green-500" /><span className="text-sm font-semibold text-gray-700">Uptime</span></div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(sys.uptime / 3600)}h</p>
          <p className="text-xs text-gray-400 mt-1">{sys.platform} · {sys.hostname}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemPage;
