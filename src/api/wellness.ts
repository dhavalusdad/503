import { useInfiniteQuery, useMutation, useQuery } from '@/api';
import { axiosGet, axiosPost } from '@/api/axios';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { userQueryKey } from '@/api/common/user.queryKey';
import { wellnessQueryKey } from '@/api/common/wellness.queryKey';
import type { WellnessDetail } from '@/features/client/types';
import { useRemoveQueries } from '@/hooks/data-fetching';

import type { QueryFunctionContext } from '@tanstack/react-query';

const BASE_PATH = '/wellness';

export const useCreateWellness = () => {
  //   const { invalidate } = useInvalidateQuery();
  const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationKey: mutationsQueryKey.createWellness(),
    mutationFn: (data: { daily_mood?: string; daily_gratitude?: string[] }) => {
      return axiosPost(`${BASE_PATH}`, { data });
    },
    onSuccess: async () => {
      //   invalidate(fieldOptionsQueryKey.getRolePermissionList());
      removeQueries();
    },
  });
};

export const usePatientWellness = () => {
  return useQuery({
    queryKey: userQueryKey.getPatientWellness(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}`);
      return response.data;
    },
    staleTime: 60 * 1000 * 10,
  });
};

export const usePatientWellnessAll = ({
  patient_id,
  enabled = true,
  limit = 10,
  sortColumn,
  sortOrder,
}: {
  patient_id: string;
  enabled?: boolean;
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
}) => {
  return useInfiniteQuery({
    queryKey: wellnessQueryKey.getPatientWellnessAll(patient_id, {
      sortColumn,
      sortOrder,
    }),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}/detail/${patient_id}`, {
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
      } as { items: WellnessDetail[]; nextPage: number | undefined; total: number };
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
    enabled: enabled,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePatientWellnessInVideoCall = (patient_id?: string, tenant_id?: string) => {
  return useQuery({
    queryKey: userQueryKey.getPatientWellness(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${patient_id}?`, {
        params: {
          tenant_id,
        },
      });
      return response.data;
    },
  });
};
