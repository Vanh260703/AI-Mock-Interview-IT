import { useState, useEffect, useRef } from 'react';
import { feedbackApi } from '../api/feedback.api.js';

export const useFeedbackPolling = (sessionId, intervalMs = 3000) => {
  const [feedback, setFeedback] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const poll = async () => {
      try {
        const res = await feedbackApi.getSessionFeedback(sessionId);
        setFeedback(res.data.data);
        if (res.data.data.progress.isComplete) {
          setIsDone(true);
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        setError(err.response?.data?.message ?? 'Lỗi khi tải feedback');
      }
    };

    poll();
    intervalRef.current = setInterval(poll, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [sessionId, intervalMs]);

  return { feedback, isDone, error };
};
