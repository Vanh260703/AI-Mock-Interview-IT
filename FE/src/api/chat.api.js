import api from './axios.js';

export const chatApi = {
  getOrCreate:      (toId)            => api.post('/chat/conversations', { toId }),
  getConversations: ()                => api.get('/chat/conversations'),
  getMessages:      (convId, params)  => api.get(`/chat/conversations/${convId}/messages`, { params }),
  sendMessage:      (convId, content) => api.post(`/chat/conversations/${convId}/messages`, { content }),
  markRead:         (convId)          => api.patch(`/chat/conversations/${convId}/read`),
};
