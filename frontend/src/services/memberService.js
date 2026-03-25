import api from './api';

export const memberService = {
  getAll: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (payload) => api.post('/members', payload),
};
