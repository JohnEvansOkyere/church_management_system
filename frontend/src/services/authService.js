import api from './api';

export const authService = {
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  changePassword: (payload) => api.post('/auth/change-password', payload),
};
