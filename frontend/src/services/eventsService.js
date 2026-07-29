import api from './api';

export const eventsService = {
  getAll: (params) => api.get('/events/', { params }),
  create: (payload) => api.post('/events/', payload),
  update: (id, payload) => api.put(`/events/${id}`, payload),
  remove: (id) => api.delete(`/events/${id}`),
  getRegistrations: (id) => api.get(`/events/${id}/registrations`),
  remind: (id, payload = {}) => api.post(`/events/${id}/remind`, payload),
};
