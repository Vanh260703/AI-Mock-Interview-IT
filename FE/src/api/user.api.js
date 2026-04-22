import api from './axios.js';

export const userApi = {
  getMyStats: () => api.get('/users/me/stats'),
  getMyProgress: (params) => api.get('/users/me/progress', { params }),
};
