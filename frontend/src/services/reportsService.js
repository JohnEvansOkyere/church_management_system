import api from './api';

export const reportsService = {
  getDashboard: () => api.get('/reports/dashboard'),
  getAttendanceMonthly: () => api.get('/reports/attendance/monthly'),
  getMembersGrowth: () => api.get('/reports/members/growth'),
};
