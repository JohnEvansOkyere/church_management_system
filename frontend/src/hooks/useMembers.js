import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../services/memberService';

export function useMembers(params) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => memberService.getAll(params).then((r) => r.data),
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => memberService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
