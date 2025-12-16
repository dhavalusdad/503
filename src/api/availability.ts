import { useQueryClient } from '@tanstack/react-query';

import { useMutation, useQuery } from '@/api';
import { axiosDelete, axiosGet, axiosPost } from '@/api/axios';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import type {
  CreateAvailabilitySlotsRequest,
  CreateAvailabilitySlotsResponse,
  GetAvailabilitySlotsRequest,
  RemoveAvailabilitySlotsRequest,
} from '@/api/types/calendar.dto';

const BASE_PATH = '/therapist-availability';

export const useGetAvailabilitySlots = (params: GetAvailabilitySlotsRequest) => {
  return useQuery({
    queryKey: calendarQueryKeys.availabilitySlots({
      startDate: params?.startDate,
      endDate: params?.endDate,
      therapist_id: params?.therapist_id,
      timezone: params?.timeZone,
      session_type: params?.session_type,
    }),
    queryFn: async () => {
      const API_URL = `${BASE_PATH}`;
      const response = await axiosGet(`${API_URL}`, {
        params: {
          therapist_id: params.therapist_id,
          date: params.date,
          session_type: params?.session_type || 'Virtual',
          ...(params?.startDate ? { startDate: params?.startDate } : {}),
          ...(params?.endDate ? { endDate: params?.endDate } : {}),
          ...(params?.timeZone ? { timezone: params?.timeZone } : {}),
        },
      });

      return response?.data;
    },
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetAvailabilitySlotsForDashboard = (params: GetAvailabilitySlotsRequest) => {
  return useQuery({
    queryKey: calendarQueryKeys.availabilitySlots({
      startDate: params?.startDate,
      endDate: params?.endDate,
      therapist_id: params?.therapist_id,
      timezone: params?.timeZone,
      session_type: params?.session_type,
    }),
    queryFn: async () => {
      const API_URL = `${BASE_PATH}/dashboard`;
      const response = await axiosGet(`${API_URL}`, {
        params: {
          therapist_id: params.therapist_id,
          date: params.date,
          session_type: params?.session_type || 'Virtual',
          ...(params?.startDate ? { startDate: params?.startDate } : {}),
          ...(params?.endDate ? { endDate: params?.endDate } : {}),
          ...(params?.timeZone ? { timezone: params?.timeZone } : {}),
        },
      });

      return response?.data;
    },
    enabled: !!params?.timeZone && !!params?.startDate && !!params?.endDate,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateAvailabilitySlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateAvailabilitySlotsRequest
    ): Promise<CreateAvailabilitySlotsResponse> => {
      const response = await axiosPost(`${BASE_PATH}`, { data });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all availability slots queries
      queryClient.invalidateQueries({
        queryKey: calendarQueryKeys.availabilitySlots(),
      });
    },
    showToast: false,
  });
};

export const useRemoveAvailabilitySlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RemoveAvailabilitySlotsRequest): Promise<void> => {
      const response = await axiosDelete(`${BASE_PATH}`, {
        data: { ids: data.ids },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all availability slots queries
      queryClient.invalidateQueries({
        queryKey: calendarQueryKeys.availabilitySlots(),
      });
    },
    showToast: false,
  });
};
