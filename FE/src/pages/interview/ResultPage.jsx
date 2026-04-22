import { useParams, useNavigate } from 'react-router-dom';
import { RotateCcw, CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useState } from 'react';
import { useFeedbackPolling } from '../../hooks/useFeedbackPolling.js';
import GradingProgress from '../../components/feedback/GradingProgress.jsx';
import MetricsRadar from '../../components/feedback/MetricsRadar.jsx';
import { scoreColor, scoreBg, LEVEL_MAP, ROLE_LABELS } from '../../lib/constants.js';

const AnswerFeedbackCard = ({ feedback }) => {
  const [open, setOpen] = useState(false);
  const q = feedback.answer?.question;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums ${scoreBg(feedback.overallScore)}`}>
            {feedback.overallScore ?? '—'}
          </span>
          <p className="text-sm text-gray-700 truncate">{feedback.answer?.content?.slice(0, 80) || '(Không có nội dung)'}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          {feedback.summary && <p className="text-sm text-gray-600 italic">"{feedback.summary}"</p>}
          {feedback.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1.5">Điểm mạnh</p>
              <ul className="space-y-1">{feedback.strengths.map((s, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-green-500">✓</span>{s}</li>
              ))}</ul>
            </div>
          )}
          {feedback.improvements?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-orange-500 mb-1.5">Cần cải thiện</p>
              <ul className="space-y-1">{feedback.improvements.map((s, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-2"><span className="text-orange-400">→</span>{s}</li>
              ))}</ul>
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
            {isDone ? '🎉 Kết quả phỏng vấn' : '⏳ Đang chấm điểm...'}
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
          <p className="text-sm text-gray-400">Không có câu trả lời nào để AI chấm điểm.<br/>Hãy thử lại và trả lời ít nhất một câu nhé!</p>
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
                {sf?.summary && <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{sf.summary}"</p>}
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
                {answers.map((f) => <AnswerFeedbackCard key={f._id} feedback={f} />)}
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
