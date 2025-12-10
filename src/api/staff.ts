import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios.ts';
import { STAFF_KEYS_NAME, staffQueryKey } from '@/api/common/staff.queryKey.ts';
import type { ApiResponse } from '@/api/types/common.dto';
import { UserRole } from '@/api/types/user.dto';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import type { AddStaffMemberFormData } from '@/pages/Admin/StaffManagement/types';

import { rolesQueryKey } from './common/roles.queryKey';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type CustomUseMutationOptions,
  type CustomUseQueryOptions,
  type UseQueryRestParamsType,
} from '.';

import type {
  CreateOrUpdateStaffMemberReturnType,
  CreateStaffMemberRequest,
  QueueStaffItem,
  QueueStaffResponse,
  StaffListParamsType,
  UpdateStaffMemberRequest,
} from './types/staff.dto';
import type { QueryFunctionContext, UseInfiniteQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

const BASE_PATH = '/staff';

interface UseInfiniteRolesQueryParams {
  limit: number;
  roleName?: string;
}

type RoleType = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type RolesQueryResponse = {
  roles: RoleType[];
  total: number;
};

export const useGetStaffList = (params: StaffListParamsType) => {
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
    queryKey: staffQueryKey.getStaffList(params),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search ?? undefined,
        sortColumn: modifiedData.sortColumn,
        sortOrder: modifiedData.sortOrder,
        timezone,
        roleSlug: UserRole.BACKOFFICE,
        ...(filters && {
          ...(filters.joined_date?.startDate ? { startDate: filters.joined_date?.startDate } : {}),
          ...(filters.joined_date?.endDate ? { endDate: filters.joined_date?.endDate } : {}),
          ...(filters.status ? { status: filters.status.value } : {}),
          ...(filters.role?.length
            ? { role: JSON.stringify(filters.role.map(item => item.value)) }
            : {}),
        }),
      };
      return await axiosGet(`${BASE_PATH}`, {
        params: queryParams,
      });
    },
    select: res => {
      if (res.data?.data?.length) {
        return res.data;
      }
      return {
        data: [],
        total: res.data?.total,
        currentPage: res.data?.currentPage,
      };
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const getInfiniteStaffAsync = async (
  page?: number,
  searchTerm?: string,
  status?: string
) => {
  try {
    const params: Record<string, string | number> = {
      page: page || 1,
      limit: 10,
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }

    const response = await axiosGet(`${BASE_PATH}`, {
      params: {
        ...params,
        roleSlug: UserRole.BACKOFFICE,
        ...(status && { status }),
      },
    });

    let staff = [];
    let hasMore = false;

    staff = response?.data?.data?.data || [];
    hasMore = response.data?.data?.hasMore || false;

    const transformedData = staff.map(
      (item: { id: string; first_name: string; last_name: string }) => ({
        value: item.id,
        label: `${item.first_name} ${item.last_name}`,
      })
    );

    return {
      data: transformedData,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to get staff list:', error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useInfiniteStaffQuery = (
  params: { search?: string; sortColumn?: string; sortOrder?: string } = {},
  options?: Omit<
    UseInfiniteQueryOptions<StaffListParamsType>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
) => {
  return useInfiniteQuery<StaffListParamsType>({
    queryKey: staffQueryKey.infiniteStaffList(),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}`, {
        params: {
          page: pageParam,
          limit: 20,
          roleSlug: UserRole.BACKOFFICE,
          ...(params.sortColumn && { sortColumn: params.sortColumn }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        },
      });

      const payload = response.data;
      const items: QueueStaffItem[] = payload?.data?.data ?? [];

      const total = payload?.data?.total ?? 0;
      return {
        items,
        nextPage: pageParam * 20 < total ? pageParam + 1 : undefined,
        total,
      } satisfies QueueStaffResponse;
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
    ...options,
  });
};

export const useCreateStaffMember = (payload: {
  options?: CustomUseMutationOptions<
    ApiResponse<CreateOrUpdateStaffMemberReturnType>,
    AxiosError,
    CreateStaffMemberRequest
  >;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateStaffMemberRequest) => {
      const response = await axiosPost(`${BASE_PATH}`, {
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate([STAFF_KEYS_NAME.LIST]);
    },
    ...options,
    ...extraParams,
  });
};

export const useUpdateStaffMember = (payload: {
  staff_id: string | undefined;
  options?: CustomUseMutationOptions<
    ApiResponse<CreateOrUpdateStaffMemberReturnType>,
    AxiosError,
    UpdateStaffMemberRequest
  >;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { staff_id, options = {}, extraParams } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: UpdateStaffMemberRequest) => {
      const response = await axiosPut(`${BASE_PATH}/${staff_id}`, {
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate([STAFF_KEYS_NAME.LIST]);
    },
    ...options,
    ...extraParams,
  });
};

export const useUpdateStaffMemberStatus = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (payload: { staff_id: string; is_active: boolean }) => {
      const { staff_id, is_active } = payload;
      const response = await axiosPut(`${BASE_PATH}/${staff_id}/is-active-toggle`, {
        data: { is_active },
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate([STAFF_KEYS_NAME.LIST]);
    },
  });
};

export const useDeleteStaffMember = (payload: {
  options?: CustomUseMutationOptions<ApiResponse<null>, AxiosError, string>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (staff_id: string) => {
      const response = await axiosDelete(`${BASE_PATH}/${staff_id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate([STAFF_KEYS_NAME.LIST]);
    },
    ...options,
    ...extraParams,
  });
};

export const useGetStaffById = (payload: {
  staff_id: string | undefined;
  options?: Partial<CustomUseQueryOptions<ApiResponse<AddStaffMemberFormData>>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { staff_id, options, extraParams } = payload;
  return useQuery({
    queryKey: staffQueryKey.getStaffById(staff_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${staff_id}`);
      return response.data;
    },
    ...options,
    ...extraParams,
  });
};

export const useInfiniteRolesQuery = ({ limit, roleName = '' }: UseInfiniteRolesQueryParams) => {
  return useInfiniteQuery<RolesQueryResponse>({
    queryKey: rolesQueryKey.infiniteRoles(limit, roleName),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosGet(`/roles`, {
        params: {
          page: pageParam,
          limit,
          search: roleName,
        },
      });
      return {
        roles: res.data.data.roles,
        total: res.data.data.total,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
