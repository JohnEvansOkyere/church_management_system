import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';

export function useAttendanceSessions(params) {
  return useQuery({
    queryKey: ['attendance-sessions', params],
    queryFn: () => attendanceService.getSessions(params).then((r) => r.data),
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
