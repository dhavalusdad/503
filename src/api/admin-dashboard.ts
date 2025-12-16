import { useInfiniteQuery, useQuery } from '@/api';
import { axiosGet } from '@/api/axios.ts';
import { adminQueryKey } from '@/api/common/admin.query';

import type { QueryFunctionContext } from '@tanstack/react-query';

const BASE_PATH = '/dashboard';

export interface UserSetting {
  id: string;
  is_active: boolean;
  updated_at: string;
}

export interface User {
  id: string;
  profile_image: string | null;
  first_name: string;
  last_name: string;
  user_settings: UserSetting[];
}

export interface Therapist {
  id: string;
  bio: string | null;
  user: User;
}

export interface TherapistResponse {
  data: Therapist[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const useGetDashboardData = (params: object) => {
  return useQuery({
    queryKey: adminQueryKey.getDashboardData(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/counts`, {
        params: {
          ...params,
        },
      });
      return response.data;
    },

    experimental_prefetchInRender: true,
  });
};

export const useInfiniteTherapistStatus = ({
  limit = 10,
  sortColumn,
  sortOrder,
}: {
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
}) => {
  return useInfiniteQuery({
    queryKey: adminQueryKey.getTherapistStatus({
      sortColumn,
      sortOrder,
    }),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}/therapist-status`, {
        params: {
          page: pageParam,
          limit,
          ...(sortColumn && { sortColumn }),
          ...(sortOrder && { sortOrder }),
        },
      });

      const payload = response.data;
      const items = payload?.data?.data ?? [];

      const total = payload?.data?.total ?? 0;
      return {
        items,
        nextPage: pageParam * limit < total ? pageParam + 1 : undefined,
        total,
      } as { items: TherapistResponse; nextPage: number | undefined; total: number };
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
    gcTime: 0,
  });
};

export const useGetPaginatedUpcomingSessions = ({
  limit = 15,
  selectedDate,
  timezone,
}: {
  limit?: number;
  selectedDate: Date;
  timezone: string;
}) => {
  return useInfiniteQuery({
    queryKey: adminQueryKey.getDashboardUpcomingSessions({ selectedDate }),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}/upcoming-sessions`, {
        params: {
          page: pageParam,
          limit,
          selectedDate,
          timezone,
        },
      });

      const payload = response.data;
      const items = payload?.data?.data ?? [];

      const total = payload?.data?.total ?? 0;
      return {
        items,
        nextPage: pageParam * limit < total ? pageParam + 1 : undefined,
        total,
      } as { items: TherapistResponse; nextPage: number | undefined; total: number };
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
  });
};

export const useGetPatientFormCompletionRate = () => {
  return useQuery({
    queryKey: adminQueryKey.getFormCompletionRate(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/form-completion-rate`);
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });
};
