import api from './axios.js';

export const socialApi = {
  getSuggestions:    ()       => api.get('/social/suggestions'),
  searchUsers:       (q)      => api.get('/social/search', { params: { q } }),
  getFriends:        ()       => api.get('/social/friends'),
  getIncoming:       ()       => api.get('/social/friend-requests'),
  sendRequest:       (toId)   => api.post('/social/friend-requests', { toId }),
  acceptRequest:     (id)     => api.patch(`/social/friend-requests/${id}/accept`),
  rejectRequest:     (id)     => api.patch(`/social/friend-requests/${id}/reject`),
  unfriend:          (userId) => api.delete(`/social/friends/${userId}`),
};
