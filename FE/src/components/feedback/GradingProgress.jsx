import { Loader2 } from 'lucide-react';

const GradingProgress = ({ progress }) => {
  const pct = progress?.total > 0 ? Math.round((progress.graded / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative w-20 h-20">
        <Loader2 className="w-20 h-20 text-violet-200 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-violet-600">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800 mb-1">AI đang chấm điểm...</p>
        <p className="text-sm text-gray-500">
          Đã chấm {progress?.graded ?? 0}/{progress?.total ?? 0} câu
        </p>
      </div>
      <div className="w-64 bg-gray-100 rounded-full h-2">
        <div
          className="bg-violet-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">Thường mất 10–30 giây</p>
    </div>
  );
};

export default GradingProgress;
