import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
// import { fieldOptionsQueryKey } from '@/api/common/rolePermission.queryKey';
import {
  //  useInvalidateQuery,
  useRemoveQueries,
} from '@/hooks/data-fetching';

import { therapyGoalQueryKey } from './common/therapyGoals.queryKey';
import { userQueryKey } from './common/user.queryKey';

import { useInfiniteQuery, useMutation, useQuery } from '.';

import type { QueryFunctionContext } from '@tanstack/react-query';

const BASE_PATH = '/therapy-goals';

export const useCreateTherapyGoals = () => {
  //   const { invalidate } = useInvalidateQuery();
  const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationKey: mutationsQueryKey.createTherapyGoals(),
    mutationFn: (data: { goal: { text?: string; completed?: boolean; client_id?: string }[] }) => {
      return axiosPost(`${BASE_PATH}`, { data });
    },
    onSuccess: async () => {
      //   invalidate(fieldOptionsQueryKey.getRolePermissionList());
      removeQueries();
    },
  });
};

export const useUpdateTherapyGoals = () => {
  const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationKey: mutationsQueryKey.updateTherapyGoals(),
    mutationFn: async (data: {
      client_id?: string;
      updates: { id: string; completed: boolean }[];
    }) => {
      // Make individual API calls for each goal update
      const updatePromises = data.updates.map(update =>
        axiosPut(`${BASE_PATH}/${update.id}`, {
          data: {
            completed: update.completed,
            client_id: data.client_id,
          },
        })
      );

      return Promise.all(updatePromises);
    },
    onSuccess: async () => {
      removeQueries();
    },
  });
};

export const useDeleteTherapyGoal = () => {
  const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationKey: mutationsQueryKey.deleteTherapyGoal(),
    mutationFn: (data: { goalId: string; client_id?: string }) => {
      return axiosDelete(`${BASE_PATH}/${data.goalId}`, {
        data: { client_id: data.client_id },
      });
    },
    onSuccess: async () => {
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
  });
};

export const useGetAllTherapyGoals = ({
  client_id,
  enabled = true,
  limit = 10,
  sortColumn,
  sortOrder,
}: {
  client_id?: string;
  enabled?: boolean;
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
}) => {
  return useInfiniteQuery({
    queryKey: therapyGoalQueryKey.getAllTherapyGoals(client_id, {
      sortColumn,
      sortOrder,
    }),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}`, {
        params: {
          client_id,
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
      } as {
        items: { id: string; text: string; completed: boolean }[];
        nextPage: number | undefined;
        total: number;
      };
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
    enabled: enabled,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
};
