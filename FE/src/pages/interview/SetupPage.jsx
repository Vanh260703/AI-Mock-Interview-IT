import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Info, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewApi } from '../../api/interview.api.js';
import { LEVEL_MAP } from '../../lib/constants.js';

const ROLES = ['General','FE','BE','FS','BA','DA','DS','DevOps','Mobile'];

const TYPES = [
  { v: 'mixed',     l: 'Tất cả',   desc: 'Kỹ thuật + hành vi, có ~20% coding', hasCoding: true },
  { v: 'technical', l: 'Kỹ thuật', desc: 'Câu hỏi technical, có ~20% coding',  hasCoding: true },
  { v: 'behavioral',l: 'Hành vi',  desc: 'Behavioral & situational, không có coding', hasCoding: false },
];

const TIMES = [
  { v: 60,  l: '1 phút'   },
  { v: 90,  l: '1.5 phút' },
  { v: 120, l: '2 phút'   },
  { v: 180, l: '3 phút'   },
  { v: 300, l: '5 phút'   },
];

const TAG_GROUPS = [
  {
    label: 'Ngôn ngữ / Framework',
    tags: ['javascript','typescript','react','vue','node.js','python','java','flutter'],
  },
  {
    label: 'Thuật toán & CTDL',
    tags: ['array','string','dynamic programming','sorting','tree','graph','recursion','hash map','two pointers','sliding window'],
  },
  {
    label: 'Khái niệm kỹ thuật',
    tags: ['oop','design pattern','system design','database','rest','security','docker','ci/cd','microservices'],
  },
];

const LEVELS = Object.entries(LEVEL_MAP);

const SetupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    level: 'intern', role: 'General', type: 'mixed',
    questionCount: 5, timePerQuestion: 120, tags: [],
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleTag = (tag) => {
    setForm((p) => ({
      ...p,
      tags: p.tags.includes(tag)
        ? p.tags.filter((t) => t !== tag)
        : [...p.tags, tag],
    }));
  };

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
      if (err.response?.status === 404) {
        toast.error('Không tìm thấy câu hỏi phù hợp. Thử bỏ bớt tag hoặc đổi role.');
      } else {
        toast.error(err.response?.data?.message ?? 'Không thể tạo session');
      }
    } finally {
      setLoading(false);
    }
  };

  const diff       = LEVEL_MAP[form.level];
  const activeType = TYPES.find((t) => t.v === form.type);

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
              <button type="button" key={k} onClick={() => set('level', k)}
                className={`py-2.5 px-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  form.level === k
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                }`}>
                {v.label}
              </button>
            ))}
          </div>
          {diff && (
            <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
              <Info size={12} />
              Độ khó: <span className={`font-medium ml-1 ${diff.color.replace('bg-','text-').replace('-100','-700')}`}>{diff.difficulty}</span>
            </p>
          )}
        </div>

        {/* Role */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Vai trò / Lĩnh vực</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button type="button" key={r} onClick={() => set('role', r)}
                className={`py-1.5 px-3 rounded-full text-sm font-medium border transition-all ${
                  form.role === r
                    ? 'border-violet-500 bg-violet-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">Loại phỏng vấn</label>
          <div className="grid grid-cols-3 gap-3">
            {TYPES.map(({ v, l, desc, hasCoding }) => (
              <button type="button" key={v} onClick={() => set('type', v)}
                className={`py-3 px-3 rounded-xl text-left border-2 transition-all ${
                  form.type === v
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-100 bg-white hover:border-gray-300'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${form.type === v ? 'text-violet-700' : 'text-gray-700'}`}>{l}</span>
                  {hasCoding && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <Code2 size={9} /> Code
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">{desc}</p>
              </button>
            ))}
          </div>

          {/* Coding note */}
          {activeType?.hasCoding && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <Code2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                <span className="font-semibold">~20% câu hỏi sẽ là coding challenge.</span>{' '}
                Câu hỏi coding có thời gian trả lời dài hơn (5–10 phút) tùy độ khó.
                Thời gian bên dưới áp dụng cho câu hỏi thường.
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-gray-800">Tags / Chủ đề</label>
            <span className="text-xs text-gray-400">Tuỳ chọn — để trống sẽ lấy ngẫu nhiên</span>
          </div>

          {form.tags.length > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-violet-600 font-medium">Đã chọn {form.tags.length} tag:</span>
              <button type="button" onClick={() => set('tags', [])}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                Xoá tất cả
              </button>
            </div>
          )}

          <div className="space-y-4">
            {TAG_GROUPS.map(({ label, tags }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = form.tags.includes(tag);
                    return (
                      <button type="button" key={tag} onClick={() => toggleTag(tag)}
                        className={`py-1 px-2.5 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? 'border-violet-500 bg-violet-600 text-white'
                            : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600'
                        }`}>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
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
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              {activeType?.hasCoding && (
                <span className="text-emerald-600 font-medium">
                  ~{Math.max(1, Math.ceil(form.questionCount * 0.2))} coding
                </span>
              )}
              <span>20</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Thời gian / câu thường
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {TIMES.map(({ v, l }) => (
                <button type="button" key={v} onClick={() => set('timePerQuestion', v)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium text-left transition-colors ${
                    form.timePerQuestion === v
                      ? 'bg-violet-50 text-violet-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary + Submit */}
        <div className="bg-violet-50 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="text-sm text-violet-700 space-y-0.5">
            <div>
              <span className="font-semibold">{form.questionCount} câu</span>
              {' · '}{form.role} · {LEVEL_MAP[form.level]?.label}
              {' · '}{activeType?.l}
            </div>
            {form.tags.length > 0 && (
              <div className="text-xs text-violet-500">
                Tags: {form.tags.slice(0, 4).join(', ')}{form.tags.length > 4 ? ` +${form.tags.length - 4}` : ''}
              </div>
            )}
          </div>
          <button
            type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium rounded-xl text-sm transition-colors shrink-0">
            {loading
              ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              : <Play size={16} />}
            Bắt đầu <ChevronRight size={16} />
          </button>
        </div>

      </form>
    </div>
  );
};

export default SetupPage;
