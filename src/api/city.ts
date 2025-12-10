import { axiosGet } from '@/api/axios.ts';
import { cityQueryKey } from '@/api/common/city.queryKey';
import type { ApiResponse } from '@/api/types/common.dto';

import { type CustomUseQueryOptions, type UseQueryRestParamsType, useQuery } from '.';

import type { AxiosError } from 'axios';

const BASE_PATH = '/city';

// Get all cities
export const useGetCities = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: cityQueryKey.getCitiesKey(params),
    queryFn: async () => {
      const response = await axiosGet(BASE_PATH, {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          ...(params?.search ? { search: params.search } : {}),
        },
      });

      if (response?.data?.data?.length) {
        return {
          data: response.data.data,
          total: response.data.total,
          currentPage: response.data.currentPage,
        };
      }

      return {
        data: [],
        total: 0,
        currentPage: 1,
      };
    },
    experimental_prefetchInRender: true,
  });
};

// Get cities by state
export const useGetCitiesByState = (
  stateId: string,
  data: {
    options?: CustomUseQueryOptions<
      ApiResponse<{ label: string; value: string; state_id: string; slug: string }[]>,
      AxiosError
    >;
    extraParams?: UseQueryRestParamsType;
    isCredentialed?: boolean;
  }
) => {
  const { options, extraParams } = data || {};

  return useQuery({
    queryKey: cityQueryKey.getCitiesByStateKey(stateId),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/state`, {
        params: { state_id: stateId },
      });
      return response?.data || [];
    },
    enabled: !!stateId,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    ...options,
    ...extraParams,
  });
};
