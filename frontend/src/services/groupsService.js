import api from './api';

export const groupsService = {
  getAll: (params) => api.get('/groups/', { params }),
  create: (payload) => api.post('/groups/', payload),
  update: (id, payload) => api.put(`/groups/${id}`, payload),
  getMembers: (id) => api.get(`/groups/${id}/members`),
  addMember: (id, member_id) => api.post(`/groups/${id}/members`, { member_id }),
  removeMember: (id, memberId) => api.delete(`/groups/${id}/members/${memberId}`),
};
