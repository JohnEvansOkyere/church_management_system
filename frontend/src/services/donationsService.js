import api from './api';

export const donationsService = {
  getAll: (params) => api.get('/donations/', { params }),
  create: (payload) => api.post('/donations/', payload),
  getFunds: () => api.get('/donations/funds'),
  bootstrapFunds: () => api.post('/donations/funds/bootstrap'),
  createFund: (payload) => api.post('/donations/funds', payload),
  getBatches: (params) => api.get('/donations/batches', { params }),
  createBatch: (payload) => api.post('/donations/batches', payload),
  getExpenses: (params) => api.get('/donations/expenses', { params }),
  createExpense: (payload) => api.post('/donations/expenses', payload),
  getExpenseCategories: () => api.get('/donations/expense-categories'),
  bootstrapExpenseCategories: () => api.post('/donations/expense-categories/bootstrap'),
  createExpenseCategory: (payload) => api.post('/donations/expense-categories', payload),
  getMonthlyReport: (params) => api.get('/donations/reports/monthly', { params }),
  getAnnualReport: (params) => api.get('/donations/reports/annual', { params }),
};
