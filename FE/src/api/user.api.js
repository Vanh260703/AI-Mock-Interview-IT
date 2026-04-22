import api from './axios.js';

export const userApi = {
  getMe:         () => api.get('/users/me'),
  getMyStats:    () => api.get('/users/me/stats'),
  getMyProgress: (params) => api.get('/users/me/progress', { params }),
  updateProfile: (data) => api.patch('/users/me', data),
  updateAvatar:  (formData) => api.patch('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
