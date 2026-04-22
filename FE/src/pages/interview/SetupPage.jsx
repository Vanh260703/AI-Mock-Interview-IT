import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewApi } from '../../api/interview.api.js';
import { LEVEL_MAP } from '../../lib/constants.js';

const ROLES   = ['General','FE','BE','FS','BA','DA','DS','DevOps','Mobile'];
const TYPES   = [{ v:'mixed', l:'Hỗn hợp' },{ v:'technical', l:'Kỹ thuật' },{ v:'behavioral', l:'Hành vi' }];
const TIMES   = [{ v:30, l:'30 giây' },{ v:60, l:'1 phút' },{ v:90, l:'1.5 phút' },{ v:120, l:'2 phút' },{ v:180, l:'3 phút' }];
const LEVELS  = Object.entries(LEVEL_MAP);

const SetupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    level: 'intern', role: 'General', type: 'mixed',
    questionCount: 5, timePerQuestion: 120,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await interviewApi.createSession({
        ...form,
        questionCount: Number(form.questionCount),
      });
      const session = res.data.data;
      navigate(`/interview/${session._id}`, { state: { session } });
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Không thể tạo session';
      if (err.response?.status === 404) {
        toast.error('Không tìm thấy câu hỏi phù hợp. Hãy thử chọn role khác.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const diff = LEVEL_MAP[form.level];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tạo phỏng vấn mới</h1>
        <p className="text-sm text-gray-500 mt-1">Cấu hình buổi phỏng vấn phù hợp với bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Level */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Level <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map(([k, v]) => (
              <button type="button" key={k}
                onClick={() => set('level', k)}
                className={`py-2.5 px-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.level === k
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          {diff && (
            <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
              <Info size={12} />
              Độ khó tương ứng: <span className={`font-medium ml-1 ${diff.color.replace('bg-', 'text-').replace('-100', '-700')}`}>{diff.difficulty}</span>
            </p>
          )}
        </div>

        {/* Role */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Vai trò / Lĩnh vực</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button type="button" key={r}
                onClick={() => set('role', r)}
                className={`py-1.5 px-3 rounded-full text-sm font-medium border transition-all ${
                  form.role === r
                    ? 'border-violet-500 bg-violet-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Loại phỏng vấn</label>
          <div className="grid grid-cols-3 gap-3">
            {TYPES.map(({ v, l }) => (
              <button type="button" key={v}
                onClick={() => set('type', v)}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.type === v
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Count + Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Số câu hỏi: <span className="text-violet-600">{form.questionCount}</span>
            </label>
            <input
              type="range" min={1} max={20} value={form.questionCount}
              onChange={(e) => set('questionCount', e.target.value)}
              className="w-full accent-violet-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>20</span></div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Thời gian / câu</label>
            <div className="grid grid-cols-1 gap-1.5">
              {TIMES.map(({ v, l }) => (
                <button type="button" key={v}
                  onClick={() => set('timePerQuestion', v)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium text-left transition-colors ${
                    form.timePerQuestion === v
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary + Submit */}
        <div className="bg-violet-50 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm text-violet-700">
            <span className="font-semibold">{form.questionCount} câu</span> · {form.role} · {LEVEL_MAP[form.level]?.label} · {LEVEL_MAP[form.level]?.difficulty}
          </div>
          <button
            type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium rounded-xl text-sm transition-colors"
          >
            {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Play size={16} />}
            Bắt đầu <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetupPage;
