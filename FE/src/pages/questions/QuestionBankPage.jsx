import { useEffect, useState } from 'react';
import { Search, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { questionApi } from '../../api/question.api.js';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { LEVEL_MAP, CATEGORY_LABELS } from '../../lib/constants.js';

const ROLES   = ['', 'FE', 'BE', 'FS', 'BA', 'DA', 'DS', 'DevOps', 'Mobile', 'General'];
const LEVELS  = ['', ...Object.keys(LEVEL_MAP)];
const DIFFS   = ['', 'easy', 'medium', 'hard'];
const CATS    = ['', 'technical', 'behavioral', 'situational', 'hr'];

const DIFF_COLOR = {
  easy: 'bg-green-50 text-green-700', medium: 'bg-yellow-50 text-yellow-700', hard: 'bg-red-50 text-red-600',
};

const QuestionModal = ({ question, onClose }) => {
  if (!question) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {question.difficulty && <Badge className={DIFF_COLOR[question.difficulty] ?? 'bg-gray-100 text-gray-600'}>{question.difficulty}</Badge>}
            {question.role && <Badge className="bg-indigo-50 text-indigo-600">{question.role}</Badge>}
            {question.level && <Badge className={LEVEL_MAP[question.level]?.color ?? 'bg-gray-100 text-gray-600'}>{LEVEL_MAP[question.level]?.label}</Badge>}
            {question.category && <Badge className="bg-gray-100 text-gray-600">{CATEGORY_LABELS[question.category] ?? question.category}</Badge>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg shrink-0"><X size={16} /></button>
        </div>
        <p className="text-base font-medium text-gray-900 mb-4">{question.content}</p>
        {question.hints?.length > 0 && (
          <div className="bg-violet-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-violet-600 mb-2">Gợi ý</p>
            <ul className="space-y-1">{question.hints.map((h, i) => (
              <li key={i} className="text-sm text-violet-700">• {h}</li>
            ))}</ul>
          </div>
        )}
        {question.sampleAnswer && (
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-600 mb-2">Câu trả lời mẫu</p>
            <p className="text-sm text-green-800 whitespace-pre-wrap">{question.sampleAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionBankPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ role: '', level: '', difficulty: '', category: '', topic: '' });

  const setF = (k, v) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1); };

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 15, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
    questionApi.getQuestions(params)
      .then((res) => { setQuestions(res.data.data); setPagination(res.data.pagination); })
      .catch(() => toast.error('Không thể tải câu hỏi'))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const openDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await questionApi.getQuestion(id);
      setSelected(res.data.data);
    } catch { toast.error('Không thể tải chi tiết'); }
    finally { setLoadingDetail(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'role', label: 'Role', opts: ROLES },
            { key: 'level', label: 'Level', opts: LEVELS, map: (v) => LEVEL_MAP[v]?.label ?? v },
            { key: 'difficulty', label: 'Độ khó', opts: DIFFS },
            { key: 'category', label: 'Loại', opts: CATS, map: (v) => CATEGORY_LABELS[v] ?? v },
          ].map(({ key, label, opts, map }) => (
            <select key={key} value={filters[key]} onChange={(e) => setF(key, e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="">{label}</option>
              {opts.filter(Boolean).map((o) => (
                <option key={o} value={o}>{map ? map(o) : o}</option>
              ))}
            </select>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.topic}
            onChange={(e) => setF('topic', e.target.value)}
            placeholder="Tìm theo chủ đề..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>

      {/* Question list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="p-4 animate-pulse"><div className="h-4 bg-gray-100 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <EmptyState icon={BookOpen} title="Không tìm thấy câu hỏi" description="Thử thay đổi bộ lọc" />
        ) : (
          <div className="divide-y divide-gray-50">
            {questions.map((q) => (
              <button key={q._id} onClick={() => openDetail(q._id)}
                className="w-full flex items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 font-medium line-clamp-2">{q.content}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {q.topic && <span className="text-xs text-gray-400">{q.topic}</span>}
                    {q.difficulty && <Badge className={DIFF_COLOR[q.difficulty] ?? 'bg-gray-100 text-gray-600'}>{q.difficulty}</Badge>}
                    {q.role && <Badge className="bg-indigo-50 text-indigo-600">{q.role}</Badge>}
                    {q.level && <Badge className={LEVEL_MAP[q.level]?.color ?? 'bg-gray-100 text-gray-600'}>{LEVEL_MAP[q.level]?.label}</Badge>}
                  </div>
                </div>
                <span className="text-xs text-violet-600 hover:underline shrink-0 mt-1">Xem</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">← Trước</button>
          <span className="text-sm text-gray-500">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">Sau →</button>
        </div>
      )}

      {/* Modal */}
      {selected && <QuestionModal question={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default QuestionBankPage;
