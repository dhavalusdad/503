import { useQueryClient } from '@tanstack/react-query';

import { axiosPost } from '@/api/axios';
import type { RequestSlotProps } from '@/features/appointment/component/ClientAppointmentsBooking/types';

import { useMutation } from '.';

const BASE_PATH = '/request-slot';

export const useCreateDemoRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: object) => {
      return await axiosPost(`${BASE_PATH}/create`, { data: payload });
    },
    onSuccess: (_, variables: RequestSlotProps) => {
      queryClient.invalidateQueries({ queryKey: [variables.email] });
    },
    onError: error => {
      console.error('Failed to request slot:', error);
    },
  });
};

export const useCreateSlotRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: object) => {
      return await axiosPost(`${BASE_PATH}/create-secure`, { data: payload });
    },
    onSuccess: (_, variables: RequestSlotProps) => {
      queryClient.invalidateQueries({ queryKey: [variables.email] });
    },
    onError: error => {
      console.error('Failed to request slot:', error);
    },
  });
};
