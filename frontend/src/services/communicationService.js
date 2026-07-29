import api from './api';

export const communicationService = {
  getHealth: () => api.get('/communication/health'),
  sendSms: (payload) => api.post('/communication/sms', payload),
  getHistory: (params) => api.get('/communication/history', { params }),
  getReminders: (params) => api.get('/communication/reminders', { params }),
  createReminder: (payload) => api.post('/communication/reminders', payload),
  updateReminder: (id, payload) => api.put(`/communication/reminders/${id}`, payload),
  removeReminder: (id) => api.delete(`/communication/reminders/${id}`),
  runDue: () => api.post('/communication/reminders/run-due'),
  getAnnouncements: (params) => api.get('/communication/announcements', { params }),
  createAnnouncement: (payload) => api.post('/communication/announcement', payload),
  updateAnnouncement: (id, payload) => api.put(`/communication/announcements/${id}`, payload),
  removeAnnouncement: (id) => api.delete(`/communication/announcements/${id}`),
};
