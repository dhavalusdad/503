import { type QueryFunctionContext } from '@tanstack/react-query';

import { useInfiniteQuery, useMutation, useQuery } from '@/api';
import { axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { appointmentQueryKey } from '@/api/common/appointment.queryKey';
import { dependentQueryKey } from '@/api/common/dependents.queryKey';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import type { DependentsResponse } from '@/api/types/dependents.dto';
import { useInvalidateQuery } from '@/hooks/data-fetching';

const BASE_PATH = '/client';

export const useInfiniteDependents = ({
  limit = 10,
  enabled = true,
  sortColumn,
  sortOrder,
  search,
}: {
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
  enabled?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: [dependentQueryKey.getAllDependentUsers({ sortColumn, sortOrder, search })],
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}/get-dependent-users`, {
        params: {
          page: pageParam,
          limit,
          ...(sortColumn && { sortColumn }),
          ...(sortOrder && { sortOrder }),
          ...(search && { search }),
        },
      });
      const payload = response.data;
      const items = payload?.data.data;
      const total = payload?.data.total ?? 0;

      return {
        items,
        nextPage: total > pageParam * limit ? pageParam + 1 : undefined,
        total,
      } as { items: DependentsResponse[]; nextPage: number | undefined };
    },
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 1,
    enabled,
    staleTime: 1000 * 60 * 1,
  });
};

export const useCreateDependent = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}/create-dependent-user`, { data });
      return response.data;
    },
    onSuccess: data => {
      invalidate([dependentQueryKey.getAllDependentUsers({})]);
      invalidate([appointmentQueryKey.listDependents(data?.data?.relationship)]);
    },
  });
};

export const useGetDependentById = (user_id: string) => {
  return useQuery({
    queryKey: dependentQueryKey.getDependentById(user_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/get-dependent-user/${user_id}`);
      return response.data;
    },
    enabled: !!user_id,
    staleTime: 1000 * 60 * 1,
  });
};

export const useUpdateDependentUser = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: ['updateDependentUser'],
    mutationFn: async ({ user_id, data }: { user_id: string; data: object }) => {
      const response = await axiosPut(`${BASE_PATH}/update-dependent-user/${user_id}`, { data });
      return response.data;
    },
    onSuccess: (_data, { user_id }) => {
      invalidate(dependentQueryKey.getDependentById(user_id));
      invalidate([dependentQueryKey.getAllDependentUsers({})]);
    },
  });
};

export const useSendMailToDependent = (onSuccess: () => void) => {
  return useMutation({
    mutationKey: mutationsQueryKey.sendMailToDependent(),
    mutationFn: async (data: object) => {
      const response = await axiosPost('appointments/send-mail', data);
      return response.data;
    },
    onSuccess,
    onError: onSuccess,
  });
};
