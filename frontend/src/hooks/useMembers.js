import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../services/memberService';

export function useMembers(params) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => memberService.getAll(params).then((r) => r.data),
  });
}

export function useMember(memberId) {
  return useQuery({
    queryKey: ['member', memberId],
    queryFn: () => memberService.getById(memberId).then((r) => r.data),
    enabled: Boolean(memberId),
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

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => memberService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => memberService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUploadMemberPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }) => memberService.uploadPhoto(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
    },
  });
}
