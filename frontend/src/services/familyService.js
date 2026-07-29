import api from './api';

export const familyService = {
  getAll: (params) => api.get('/families/', { params }),
  create: (payload) => api.post('/families/', payload),
  getById: (id) => api.get(`/families/${id}`),
};
