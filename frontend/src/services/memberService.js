import api from './api';

export const memberService = {
  getAll: (params) => api.get('/members', { params }),
  create: (payload) => api.post('/members', payload),
};
