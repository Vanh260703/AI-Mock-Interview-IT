import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { SkipForward, ChevronRight, AlertTriangle, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewApi } from '../../api/interview.api.js';
import CountdownTimer from '../../components/interview/CountdownTimer.jsx';
import AnswerRecorder from '../../components/interview/AnswerRecorder.jsx';
import CodeEditor from '../../components/interview/CodeEditor.jsx';
import LeetCodeQuestionPanel from '../../components/interview/LeetCodeQuestionPanel.jsx';
import MarkdownContent from '../../components/ui/MarkdownContent.jsx';
import { LEVEL_MAP } from '../../lib/constants.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';

const SessionPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [session, setSession] = useState(state?.session ?? null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [content, setContent] = useState('');
  const [mediaBlob, setMediaBlob] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  // Load session if not in state
  useEffect(() => {
    if (!session) {
      interviewApi.getSession(id)
        .then((res) => setSession(res.data.data.session))
        .catch(() => { toast.error('Không tìm thấy session'); navigate('/history'); });
    }
  }, [id]);

  // Prevent accidental navigation
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const questions = session?.questions ?? [];
  const currentQ  = questions[currentIndex];
  const isLast    = currentIndex === questions.length - 1;
  const isCoding  = currentQ?.type === 'coding';

  // Timer: coding questions use expectedDuration (default 600s), text questions use session setting
  const timerSeconds = isCoding
    ? (currentQ?.expectedDuration ?? 600)
    : (session?.settings?.timePerQuestion ?? 120);

  // Reset content when question changes
  useEffect(() => {
    setContent('');
    setMediaBlob(null);
  }, [currentQ?._id]);

  const resetForNextQ = useCallback(() => {
    setContent('');
    setMediaBlob(null);
    setStartTime(Date.now());
    setTimerKey((k) => k + 1);
  }, []);

  const submitAndAdvance = useCallback(async (skip = false) => {
    if (!currentQ || isSubmitting) return;
    setIsSubmitting(true);

    const duration = Math.round((Date.now() - startTime) / 1000);

    try {
      if (skip || (!content.trim() && !mediaBlob)) {
        await interviewApi.submitAnswer(id, {
          questionId: currentQ._id,
          content: '',
          duration,
          status: 'skipped',
        });
      } else if (mediaBlob) {
        const fd = new FormData();
        fd.append('questionId', currentQ._id);
        fd.append('duration', duration);
        fd.append('status', 'submitted');
        fd.append('media', mediaBlob, 'answer.webm');
        await interviewApi.submitAnswer(id, fd);
      } else {
        await interviewApi.submitAnswer(id, {
          questionId: currentQ._id,
          content: content.trim(),
          duration,
          status: 'submitted',
        });
      }

      if (isLast) {
        await interviewApi.completeSession(id);
        navigate(`/interview/${id}/results`);
      } else {
        resetForNextQ();
        setCurrentIndex((i) => i + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Lỗi khi lưu câu trả lời');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQ, isSubmitting, content, mediaBlob, isLast, id, startTime, resetForNextQ]);

  if (!session) return (
    <div className="flex items-center justify-center h-full">
      <LoadingSpinner size="lg" />
    </div>
  );

  const level = session.settings?.level;
  const role  = session.settings?.role;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-gray-800">
            Câu {currentIndex + 1}/{questions.length}
          </span>
          {isCoding && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
              <Code2 size={11} /> Coding
            </span>
          )}
          {role && (
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
              {role}
            </span>
          )}
          {level && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_MAP[level]?.color ?? 'bg-gray-100 text-gray-600'}`}>
              {LEVEL_MAP[level]?.label}
            </span>
          )}
        </div>
        <CountdownTimer key={timerKey} seconds={timerSeconds} onExpire={() => submitAndAdvance(false)} />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-1 bg-violet-500 transition-all duration-500"
          style={{ width: `${(currentIndex / questions.length) * 100}%` }}
        />
      </div>

      {/* Content — different layout for coding vs text */}
      {isCoding ? (
        // Coding: dark left panel (LeetCode-style question) + right editor panel
        <div className="flex-1 flex overflow-hidden bg-[#1a1a2e]">
          {/* Question panel — 40% width, LeetCode dark theme */}
          <div className="w-[40%] border-r border-gray-700/60 overflow-hidden bg-[#16213e] flex flex-col">
            <LeetCodeQuestionPanel question={currentQ} />
          </div>

          {/* Editor panel — 60% width */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
            <div className="flex-1 min-h-0 p-3">
              <CodeEditor value={content} onChange={setContent} />
            </div>
          </div>
        </div>
      ) : (
        // Text: original 50/50 layout, light theme
        <div className="flex-1 flex overflow-hidden">
          {/* Question */}
          <div className="w-1/2 border-r border-gray-100 p-6 overflow-y-auto">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Câu hỏi</span>
              {currentQ?.difficulty && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  currentQ.difficulty === 'easy'   ? 'bg-green-50 text-green-600'
                  : currentQ.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-red-50 text-red-600'
                }`}>{currentQ.difficulty}</span>
              )}
            </div>
            <div className="text-base leading-relaxed">
              <MarkdownContent theme="light">{currentQ?.content ?? ''}</MarkdownContent>
            </div>
            {currentQ?.topic && (
              <p className="mt-4 text-xs text-gray-400">Chủ đề: {currentQ.topic}</p>
            )}
          </div>

          {/* Answer */}
          <div className="w-1/2 p-6 flex flex-col">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
              Câu trả lời của bạn
            </p>
            <div className="flex-1">
              <AnswerRecorder
                value={content}
                onChange={setContent}
                onMediaReady={setMediaBlob}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className={`border-t px-6 py-4 flex items-center justify-between ${isCoding ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-100'}`}>
        <button
          type="button"
          onClick={() => submitAndAdvance(true)}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-colors disabled:opacity-50 ${
            isCoding
              ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:border-gray-400'
              : 'text-gray-500 hover:text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <SkipForward size={16} /> Bỏ qua
        </button>

        <div className={`flex items-center gap-2 text-xs ${isCoding ? 'text-gray-500' : 'text-gray-400'}`}>
          <AlertTriangle size={12} /> Thoát sẽ mất tiến độ
        </div>

        <button
          type="button"
          onClick={() => submitAndAdvance(false)}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium rounded-xl text-sm transition-colors"
        >
          {isSubmitting && (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          {isLast ? 'Hoàn thành' : 'Câu tiếp theo'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SessionPage;
