// hooks/useRoles.ts
import { keepPreviousData } from '@tanstack/react-query';

import { axiosGet, axiosPost } from '@/api/axios';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { fieldOptionsQueryKey } from '@/api/common/rolePermission.queryKey';
import { useInvalidateQuery, useRemoveQueries } from '@/hooks/data-fetching';

import { useMutation, useQuery } from '.';

import type { RolePayload } from '@features/admin/components/RolePermission/type';

const BASE_PATH = '/roles';

export const useRolesQuery = (params: object) => {
  return useQuery({
    queryKey: fieldOptionsQueryKey.getRolePermissionList(params),
    queryFn: async () => {
      const res = await axiosGet(`${BASE_PATH}`, { params });
      return {
        data: res.data.data,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export const useCreateRole = () => {
  const { invalidate } = useInvalidateQuery();
  // const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationKey: mutationsQueryKey.createRole(),
    mutationFn: (data: RolePayload) => {
      return axiosPost(`${BASE_PATH}`, { data });
    },
    onSuccess: async () => {
      invalidate(fieldOptionsQueryKey.getRolePermissionList());
      // removeQueries();
    },
  });
};

export const useUpdateRole = () => {
  const { invalidate } = useInvalidateQuery();
  const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RolePayload }) => {
      return axiosPost(`${BASE_PATH}/updaterole/${id}`, { data });
    },
    onSuccess: () => {
      invalidate(fieldOptionsQueryKey.getRolePermissionList());
      removeQueries();
    },
  });
};

export const useDeleteRole = () => {
  const { invalidate } = useInvalidateQuery();
  const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationFn: (id: string) => axiosPost(`${BASE_PATH}/deleterole/${id}`),
    onSuccess: () => {
      invalidate(fieldOptionsQueryKey.getRolePermissionList());
      removeQueries();
    },
  });
};

export const getRolesOptions = async (page?: number, searchTerm?: string) => {
  try {
    const params = {
      ...(searchTerm ? { search: searchTerm } : {}),
      page: page || 1,
      limit: 25,
    };
    const response = await axiosGet(`${BASE_PATH}/options`, { params });
    const { data } = response.data;
    const therapists = data?.data || [];
    const hasMore = data.hasMore;
    const options = therapists?.map((therapist: { id: string; name: string }) => {
      const { id, name } = therapist;
      return {
        label: name,
        value: id,
      };
    });
    return {
      data: options,
      hasMore,
    };
  } catch (error) {
    if (error) {
      return {
        data: [],
        hasMore: false,
      };
    }
  }
};
