import api from './axios.js';

export const feedbackApi = {
  getSessionFeedback: (sessionId) => api.get(`/feedback/session/${sessionId}`),
  requestFeedback: (sessionId) => api.post(`/feedback/session/${sessionId}`),
};
