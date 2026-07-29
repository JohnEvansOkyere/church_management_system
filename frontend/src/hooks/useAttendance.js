import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';

export function useAttendanceSessions(params) {
  return useQuery({
    queryKey: ['attendance-sessions', params],
    queryFn: () => attendanceService.getSessions(params).then((r) => r.data),
  });
}

export function useAttendanceSession(sessionId) {
  return useQuery({
    queryKey: ['attendance-session', sessionId],
    queryFn: () => attendanceService.getSessionById(sessionId).then((r) => r.data),
    enabled: Boolean(sessionId),
  });
}

export function useMemberAttendanceHistory(memberId) {
  return useQuery({
    queryKey: ['member-attendance-history', memberId],
    queryFn: () => attendanceService.getMemberHistory(memberId).then((r) => r.data),
    enabled: Boolean(memberId),
  });
}

export function useAttendanceSummary() {
  return useQuery({
    queryKey: ['attendance-summary'],
    queryFn: () => attendanceService.getSummary().then((r) => r.data),
  });
}

export function useCreateAttendanceSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => attendanceService.createSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    },
  });
}

export function useMarkAttendance(sessionId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => attendanceService.markAttendance(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    },
  });
}
