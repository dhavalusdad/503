import { axiosGet, axiosPut } from '@/api/axios';
import type { UpdateQueueRequest } from '@/api/types/queue.dto';
import type { QueueMangementParamsType } from '@/api/types/user.dto';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { queueQueryKey } from './common/queue.query';

import { useMutation, useQuery } from '.';

const BASE_PATH = '/backoffice-queue';

export const useGetQueueQuery = (params: QueueMangementParamsType) => {
  const { page, limit, search, filters, timezone, sortColumn, sortOrder } = params;
  const defaultData = {
    sortColumn: 'created_at',
    sortOrder: 'desc',
  };
  const modifiedData = {
    sortColumn: sortColumn || defaultData.sortColumn,
    sortOrder: sortOrder || defaultData.sortOrder,
  };
  return useQuery({
    queryKey: queueQueryKey.getList({
      ...params,
      ...modifiedData,
    }),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search ?? undefined,
        sortColumn: modifiedData.sortColumn,
        sortOrder: modifiedData.sortOrder,
        timezone,
        ...(filters && {
          ...(filters.created_at?.startDate ? { startDate: filters.created_at?.startDate } : {}),
          ...(filters.created_at?.endDate ? { endDate: filters.created_at?.endDate } : {}),
          ...(filters.status?.length ? { status: filters.status.map(item => item.value) } : {}),
          ...(filters.assigned_to_role?.length
            ? { assigned_to_role: filters.assigned_to_role.map(item => item.value) }
            : {}),
          ...(filters.request_type?.length
            ? { request_type: filters.request_type.map(item => item.value) }
            : {}),
        }),
      };
      return await axiosGet(`${BASE_PATH}`, { params: queryParams });
    },
    select: res => {
      return {
        data: res.data.data,
        total: res.data.total,
        currentPage: res.data.page,
      };
    },
    // placeholderData: keepPreviousData,
  });
};

export const useUpdateQueueRequest = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({ data, id }: { data: UpdateQueueRequest; id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(['queue', 'list']);
    },
  });
};

export const useGetQueueDetails = (queueId: string) => {
  return useQuery({
    queryKey: queueQueryKey.getQueueById(queueId),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${queueId}`);
      return response.data;
    },
    enabled: !!queueId,
  });
};
