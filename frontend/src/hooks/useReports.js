import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reportsService';

export function useDashboardReport() {
  return useQuery({
    queryKey: ['reports-dashboard'],
    queryFn: () => reportsService.getDashboard().then((r) => r.data),
  });
}

export function useAttendanceMonthlyReport() {
  return useQuery({
    queryKey: ['reports-attendance-monthly'],
    queryFn: () => reportsService.getAttendanceMonthly().then((r) => r.data),
  });
}


export function useDonationsMonthlyReport() {
  return useQuery({
    queryKey: ['reports-donations-monthly'],
    queryFn: () => reportsService.getDonationsMonthly().then((r) => r.data),
  });
}

export function useExpensesMonthlyReport() {
  return useQuery({
    queryKey: ['reports-expenses-monthly'],
    queryFn: () => reportsService.getExpensesMonthly().then((r) => r.data),
  });
}


export function useMembersGrowthReport() {
  return useQuery({
    queryKey: ['reports-members-growth'],
    queryFn: () => reportsService.getMembersGrowth().then((r) => r.data),
  });
}
