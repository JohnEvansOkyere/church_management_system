import api from './api';

export const pastoralService = {
  getAll: (params) => api.get('/pastoral/', { params }),
  create: (payload) => api.post('/pastoral/', payload),
  update: (id, payload) => api.put(`/pastoral/${id}`, payload),
};
