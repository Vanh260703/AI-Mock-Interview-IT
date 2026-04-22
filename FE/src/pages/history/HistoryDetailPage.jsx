import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewApi } from '../../api/interview.api.js';
import MetricsRadar from '../../components/feedback/MetricsRadar.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { PageLoader } from '../../components/ui/LoadingSpinner.jsx';
import { STATUS_MAP, LEVEL_MAP, scoreColor, scoreBg, formatDate, formatDuration } from '../../lib/constants.js';

// Mini code block cho coding answer
const CodeAnswer = ({ code }) => (
  <div className="rounded-lg overflow-hidden border border-gray-700 mt-2">
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e1e] border-b border-gray-700">
      <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
      <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
      <div className="w-2 h-2 rounded-full bg-[#28c840]" />
      <span className="ml-2 text-xs text-gray-400 font-mono">solution.js</span>
    </div>
    <pre className="bg-[#1e1e1e] text-gray-200 text-xs font-mono px-4 py-3 overflow-x-auto max-h-52 leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

const AnswerItem = ({ answer, feedback, question, index }) => {
  const [open, setOpen] = useState(false);
  const isCoding = question?.type === 'coding';
  const content = answer.content ?? '';

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Score / status */}
        {feedback ? (
          <span className={`px-2 py-1 rounded-lg text-sm font-bold shrink-0 tabular-nums ${scoreBg(feedback.overallScore)}`}>
            {feedback.overallScore}
          </span>
        ) : (
          <span className="px-2 py-1 rounded-lg text-sm font-bold shrink-0 bg-gray-100 text-gray-400">
            {answer.status === 'skipped' ? 'Skip' : '—'}
          </span>
        )}

        <div className="flex-1 min-w-0">
          {/* Question number + badges */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-400">Câu {index + 1}</span>
            {isCoding && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium">
                <Code2 size={9} /> Coding
              </span>
            )}
            {question?.difficulty && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                question.difficulty === 'easy' ? 'bg-green-50 text-green-600'
                : question.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600'
                : 'bg-red-50 text-red-600'
              }`}>{question.difficulty}</span>
            )}
          </div>

          {/* Question text */}
          {question?.content && (
            <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
              {question.content.split('\n')[0]}
            </p>
          )}

          {/* Answer preview */}
          {content ? (
            isCoding
              ? <p className="text-xs text-gray-400 mt-1 font-mono">{content.split('\n')[0].slice(0, 60)}…</p>
              : <p className="text-xs text-gray-400 mt-1 truncate">{content.slice(0, 80)}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1 italic">
              {answer.status === 'skipped' ? 'Đã bỏ qua câu hỏi này' : 'Không có nội dung'}
            </p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{formatDuration(answer.duration)}</span>
          {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          {/* Full question */}
          {question?.content && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Câu hỏi</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">
                {question.content.split('\n')[0]}
              </p>
            </div>
          )}

          {/* Full answer */}
          {content && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Câu trả lời của bạn</p>
              {isCoding
                ? <CodeAnswer code={content} />
                : <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">{content}</p>
              }
            </div>
          )}

          {/* AI feedback */}
          {feedback && (
            <>
              {feedback.summary && (
                <p className="text-sm text-gray-600 italic border-l-2 border-violet-200 pl-3">"{feedback.summary}"</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {feedback.strengths?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-1.5">Điểm mạnh</p>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-green-500 shrink-0">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-500 mb-1.5">Cần cải thiện</p>
                    <ul className="space-y-1">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-orange-400 shrink-0">→</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {feedback.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {feedback.keywords.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded text-xs">#{k}</span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const HistoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewApi.getSession(id)
      .then((res) => setData(res.data.data))
      .catch(() => { toast.error('Không tìm thấy session'); navigate('/history'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { session, answers, feedbacks } = data;
  const sessionFb = feedbacks?.find((f) => f.type === 'session');
  const answerFbs = feedbacks?.filter((f) => f.type === 'answer') ?? [];

  // Build question lookup: questionId → question object
  const questionMap = {};
  (session.questions ?? []).forEach((q) => {
    questionMap[q._id?.toString() ?? q.toString()] = q;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/history')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chi tiết phỏng vấn</h1>
          <p className="text-sm text-gray-400">{formatDate(session.completedAt ?? session.createdAt)}</p>
        </div>
      </div>

      {/* Session overview */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge className={STATUS_MAP[session.status]?.color ?? 'bg-gray-100 text-gray-600'}>
                {STATUS_MAP[session.status]?.label ?? session.status}
              </Badge>
              {session.settings?.role && <Badge className="bg-indigo-50 text-indigo-600">{session.settings.role}</Badge>}
              {session.settings?.level && (
                <Badge className={LEVEL_MAP[session.settings.level]?.color ?? 'bg-gray-100 text-gray-600'}>
                  {LEVEL_MAP[session.settings.level]?.label}
                </Badge>
              )}
              <Badge className="bg-gray-100 text-gray-600 capitalize">{session.type}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs">Số câu</p><p className="font-medium">{session.settings?.questionCount ?? '—'}</p></div>
              <div><p className="text-gray-400 text-xs">Thời gian</p><p className="font-medium">{formatDuration(session.duration)}</p></div>
              <div><p className="text-gray-400 text-xs">Hoàn thành</p><p className="font-medium">{formatDate(session.completedAt)}</p></div>
            </div>
          </div>
          {session.overallScore != null && (
            <div className="text-center shrink-0">
              <div className={`text-5xl font-black ${scoreColor(session.overallScore)}`}>{session.overallScore}</div>
              <p className="text-xs text-gray-400 mt-1">/ 100</p>
            </div>
          )}
        </div>

        {/* Session feedback summary */}
        {sessionFb && (
          <div className="mt-5 pt-5 border-t border-gray-50 flex gap-6">
            <div className="flex-1 space-y-3">
              {sessionFb.summary && (
                <p className="text-sm text-gray-600 italic border-l-2 border-violet-200 pl-3">"{sessionFb.summary}"</p>
              )}
              {sessionFb.improvements?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-orange-500 mb-1.5">Cần cải thiện</p>
                  <ul className="space-y-1">
                    {sessionFb.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-orange-400 shrink-0">→</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {sessionFb.metrics && <div className="w-48 shrink-0"><MetricsRadar metrics={sessionFb.metrics} /></div>}
          </div>
        )}
      </div>

      {/* Answers */}
      {answers?.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Câu trả lời ({answers.length})
          </h2>
          <div className="space-y-2">
            {answers.map((a, i) => {
              const fb = answerFbs.find(
                (f) => f.answer?._id === a._id || f.answer === a._id
              );
              const question = questionMap[a.question?.toString() ?? ''];
              return (
                <AnswerItem
                  key={a._id}
                  answer={a}
                  feedback={fb}
                  question={question}
                  index={i}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryDetailPage;
