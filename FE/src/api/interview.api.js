import api from './axios.js';

export const interviewApi = {
  createSession: (data) => api.post('/interviews', data),
  getSessions: (params) => api.get('/interviews', { params }),
  getSession: (id) => api.get(`/interviews/${id}`),
  submitAnswer: (sessionId, data) => {
    const isFormData = data instanceof FormData;
    return api.post(`/interviews/${sessionId}/answers`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  completeSession: (id) => api.put(`/interviews/${id}/complete`),
};
