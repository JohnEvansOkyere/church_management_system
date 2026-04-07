import api from './api';

export const donationsService = {
  getAll: (params) => api.get('/donations/', { params }),
  create: (payload) => api.post('/donations/', payload),
  getFunds: () => api.get('/donations/funds'),
  createFund: (payload) => api.post('/donations/funds', payload),
  getMonthlyReport: (params) => api.get('/donations/reports/monthly', { params }),
  getAnnualReport: (params) => api.get('/donations/reports/annual', { params }),
};
