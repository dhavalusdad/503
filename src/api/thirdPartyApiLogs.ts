import { useInvalidateQuery } from '@/hooks/data-fetching';

import { axiosGet, axiosPost } from './axios';

import { useMutation, useQuery } from '.';

const BASE_PATH = '/third-party-api-logs';

export const useGetThirdPartyApiLogs = (params: object = {}) => {
  return useQuery({
    queryKey: ['third-party-api-logs', params],
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}`, { params });
      return response.data;
    },
  });
};

export const useGetThirdPartyApiLogDetails = (id: string) => {
  return useQuery({
    queryKey: ['third-party-api-log-details', id],
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useRetryThirdPartyApiLog = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: ['retry-third-party-api-log'],
    mutationFn: async (id: string) => {
      const response = await axiosPost(`${BASE_PATH}/retry`, {
        data: {
          api_log_id: id,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate(['third-party-api-logs']);
      invalidate(['third-party-api-log-details']);
    },
    showToast: true,
  });
};
