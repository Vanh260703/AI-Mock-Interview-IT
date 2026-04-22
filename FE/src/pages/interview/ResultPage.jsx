import { useParams, useNavigate } from 'react-router-dom';
import { RotateCcw, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { useState } from 'react';
import { useFeedbackPolling } from '../../hooks/useFeedbackPolling.js';
import GradingProgress from '../../components/feedback/GradingProgress.jsx';
import MetricsRadar from '../../components/feedback/MetricsRadar.jsx';
import { scoreColor, scoreBg, LEVEL_MAP } from '../../lib/constants.js';

// Render code answer với syntax highlight đơn giản
const CodeAnswer = ({ code }) => (
  <div className="rounded-lg overflow-hidden border border-gray-700 mt-2">
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1e1e] border-b border-gray-700">
      <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
      <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
      <div className="w-2 h-2 rounded-full bg-[#28c840]" />
      <span className="ml-2 text-xs text-gray-400 font-mono">solution.js</span>
    </div>
    <pre className="bg-[#1e1e1e] text-gray-200 text-xs font-mono px-4 py-3 overflow-x-auto max-h-48 leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

const AnswerFeedbackCard = ({ feedback, index }) => {
  const [open, setOpen] = useState(false);
  const question = feedback.answer?.question;
  const isCoding = question?.type === 'coding';
  const answerContent = feedback.answer?.content ?? '';

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Score badge */}
        <span className={`px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums shrink-0 ${scoreBg(feedback.overallScore)}`}>
          {feedback.overallScore ?? '—'}
        </span>

        <div className="flex-1 min-w-0">
          {/* Question number + type badge */}
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
          {answerContent ? (
            isCoding ? (
              <p className="text-xs text-gray-400 mt-1 font-mono">{answerContent.split('\n')[0].slice(0, 60)}…</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1 truncate">{answerContent.slice(0, 80)}</p>
            )
          ) : (
            <p className="text-xs text-gray-400 mt-1 italic">Không có nội dung</p>
          )}
        </div>

        {open
          ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {/* Full answer */}
          {answerContent && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Câu trả lời của bạn</p>
              {isCoding
                ? <CodeAnswer code={answerContent} />
                : <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">{answerContent}</p>
              }
            </div>
          )}

          {/* AI feedback */}
          {feedback.summary && (
            <p className="text-sm text-gray-600 italic border-l-2 border-violet-200 pl-3">"{feedback.summary}"</p>
          )}
          {feedback.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1.5">Điểm mạnh</p>
              <ul className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-green-500 shrink-0">✓</span>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {feedback.improvements?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-orange-500 mb-1.5">Cần cải thiện</p>
              <ul className="space-y-1">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-orange-400 shrink-0">→</span>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {feedback.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {feedback.keywords.map((k, i) => (
                <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded text-xs">#{k}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { feedback, isDone } = useFeedbackPolling(id);

  const session    = feedback?.session;
  const sf         = feedback?.sessionFeedback;
  const answers    = feedback?.answerFeedbacks ?? [];
  const progress   = feedback?.progress;
  const allSkipped = progress?.allSkipped ?? false;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isDone ? 'Kết quả phỏng vấn' : 'Đang chấm điểm...'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isDone ? 'AI đã phân tích xong toàn bộ câu trả lời của bạn' : 'Vui lòng chờ trong giây lát'}
          </p>
        </div>
        {isDone && (
          <button
            onClick={() => navigate('/interview/setup')}
            className="flex items-center gap-2 px-4 py-2 border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw size={15} /> Phỏng vấn lại
          </button>
        )}
      </div>

      {!isDone ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <GradingProgress progress={progress} />
        </div>
      ) : allSkipped ? (
        <div className="bg-white rounded-xl p-10 shadow-sm border border-gray-100 text-center space-y-4">
          <p className="text-4xl">😅</p>
          <p className="text-lg font-semibold text-gray-700">Bạn đã bỏ qua tất cả câu hỏi</p>
          <p className="text-sm text-gray-400">
            Không có câu trả lời nào để AI chấm điểm.<br />
            Hãy thử lại và trả lời ít nhất một câu nhé!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => navigate('/history')}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:border-gray-300 rounded-xl text-sm font-medium transition-colors">
              Xem lịch sử
            </button>
            <button onClick={() => navigate('/interview/setup')}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl text-sm transition-colors">
              <RotateCcw size={15} /> Phỏng vấn lại
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall score */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-6">
              <div className="text-center shrink-0">
                <div className={`text-6xl font-black tabular-nums ${scoreColor(session?.overallScore)}`}>
                  {session?.overallScore ?? '—'}
                </div>
                <p className="text-xs text-gray-400 mt-1">/ 100</p>
              </div>
              <div className="flex-1">
                {sf?.summary && (
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 italic border-l-2 border-violet-200 pl-3">
                    "{sf.summary}"
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {sf?.strengths?.map((s, i) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-600">
                      <span className="text-green-500 shrink-0">✓</span>{s}
                    </div>
                  ))}
                </div>
              </div>
              {sf?.metrics && (
                <div className="w-56 shrink-0">
                  <MetricsRadar metrics={sf.metrics} />
                </div>
              )}
            </div>
          </div>

          {/* Improvements */}
          {sf?.improvements?.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700 mb-3">Cần cải thiện</p>
              <ul className="space-y-2">
                {sf.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-700 flex gap-2">
                    <span className="shrink-0">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Per-answer */}
          {answers.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-3">
                Phản hồi từng câu ({answers.length} câu)
              </h2>
              <div className="space-y-2">
                {answers.map((f, i) => (
                  <AnswerFeedbackCard key={f._id} feedback={f} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/history')}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:border-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              Xem lịch sử
            </button>
            <button
              onClick={() => navigate('/interview/setup')}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl text-sm transition-colors"
            >
              <RotateCcw size={15} /> Phỏng vấn lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
