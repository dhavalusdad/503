// hooks/useRoles.ts
import { keepPreviousData } from '@tanstack/react-query';

import { useMutation, useQuery } from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { rolePermissionsQueryKey } from '@/api/common/rolePermission.queryKey';
import type { RolePayload } from '@/features/admin/components/RolePermission/type';
import { useInvalidateQuery, useRemoveQueries } from '@/hooks/data-fetching';

const BASE_PATH = '/roles';

export const useRolesQuery = (params: object) => {
  return useQuery({
    queryKey: rolePermissionsQueryKey.getRolePermissionList(params),
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
  return useMutation({
    mutationKey: mutationsQueryKey.createRole(),
    mutationFn: async (data: RolePayload) => {
      const res = await axiosPost(`${BASE_PATH}`, { data });
      return res.data;
    },
    onSuccess: async () => {
      invalidate(rolePermissionsQueryKey.getRolePermissionList());
    },
  });
};

export const useUpdateRole = () => {
  const { invalidate } = useInvalidateQuery();
  const { removeQueries } = useRemoveQueries();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RolePayload }) => {
      const res = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return res.data;
    },
    onSuccess: () => {
      invalidate(rolePermissionsQueryKey.getRolePermissionList());
      removeQueries();
    },
  });
};

export const useDeleteRole = () => {
  const { invalidate } = useInvalidateQuery();
  const { removeQueries } = useRemoveQueries();
  return useMutation({
    mutationFn: (id: string) => axiosDelete(`${BASE_PATH}/${id}`),
    onSuccess: () => {
      invalidate(rolePermissionsQueryKey.getRolePermissionList());
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

export const useGetPermissionsByRoleId = (roleId?: string) => {
  return useQuery({
    queryKey: rolePermissionsQueryKey.getByRoleId(roleId),
    queryFn: async () => {
      const res = await axiosGet(`${BASE_PATH}/${roleId}/permissions`);
      return res.data;
    },
    enabled: !!roleId,
  });
};
