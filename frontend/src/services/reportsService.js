import api from './api';

export const reportsService = {
  getDashboard: () => api.get('/reports/dashboard'),
  getAttendanceMonthly: () => api.get('/reports/attendance/monthly'),
  getDonationsMonthly: () => api.get('/reports/donations/monthly'),
  getExpensesMonthly: () => api.get('/reports/expenses/monthly'),
  getMembersGrowth: () => api.get('/reports/members/growth'),
};
