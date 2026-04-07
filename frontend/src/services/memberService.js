import api from './api';

export const memberService = {
  getAll: (params) => api.get('/members/', { params }),
  getById: (id) => api.get(`/members/${id}`),
  getActivity: (id) => api.get(`/members/${id}/activity`),
  create: (payload) => api.post('/members/', payload),
  update: (id, payload) => api.put(`/members/${id}`, payload),
  remove: (id) => api.delete(`/members/${id}`),
  uploadPhoto: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/members/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportCsv: () => api.get('/members/export', { responseType: 'blob' }),
};
