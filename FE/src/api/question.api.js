import api from './axios.js';

export const questionApi = {
  getQuestions: (params) => api.get('/questions', { params }),
  getRandomQuestions: (params) => api.get('/questions/random', { params }),
  getCategories: () => api.get('/questions/categories'),
  getQuestion: (id) => api.get(`/questions/${id}`),
};
