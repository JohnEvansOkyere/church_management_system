import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { donationsService } from '../services/donationsService';


export function useDonations(params) {
  return useQuery({
    queryKey: ['donations', params],
    queryFn: () => donationsService.getAll(params).then((r) => r.data),
  });
}


export function useDonationFunds() {
  return useQuery({
    queryKey: ['donation-funds'],
    queryFn: () => donationsService.getFunds().then((r) => r.data),
  });
}


export function useDonationAnnualReport(year) {
  return useQuery({
    queryKey: ['donation-annual-report', year],
    queryFn: () => donationsService.getAnnualReport({ year }).then((r) => r.data),
  });
}


export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => donationsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation-annual-report'] });
      queryClient.invalidateQueries({ queryKey: ['reports-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports-donations-monthly'] });
    },
  });
}


export function useCreateDonationFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => donationsService.createFund(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-funds'] });
    },
  });
}
