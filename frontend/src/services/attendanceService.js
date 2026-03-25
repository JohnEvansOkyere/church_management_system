import api from './api';

export const attendanceService = {
  getSessions: (params) => api.get('/attendance/sessions', { params }),
  createSession: (payload) => api.post('/attendance/sessions', payload),
  getSummary: () => api.get('/attendance/summary'),
};
