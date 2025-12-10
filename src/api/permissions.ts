import { axiosGet, axiosPut } from '@/api/axios';
import { dispatchSetPermissions } from '@/redux/dispatch/permission.dispatch';

import { PermissionQueryKey } from './common/permissions.queryKey';

import { useMutation, useQuery } from '.';

import type { UpdateUserPermissionRequestBodyType } from './types/permissions.dto';

const BASE_PATH = '/permissions';

export const useUpdateUserPermission = ({
  onSuccess,
  onMutate,
  onSettled,
}: {
  onSuccess: () => void;
  onMutate?: (variable: UpdateUserPermissionRequestBodyType) => void;
  onSettled?: (variable: UpdateUserPermissionRequestBodyType) => void;
}) => {
  return useMutation({
    mutationFn: async (data: UpdateUserPermissionRequestBodyType) => {
      const response = await axiosPut(`${BASE_PATH}`, {
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      onSuccess();
    },
    ...(onMutate && { onMutate: variables => onMutate(variables) }),
    ...(onSettled && { onSettled: (_, __, variables) => onSettled(variables) }),
  });
};

export const useGetUserPermission = ({ isEnabled = false }: { isEnabled: boolean }) => {
  return useQuery({
    queryKey: PermissionQueryKey.getAllPermission(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}`);
      const data = response?.data?.data || [];
      dispatchSetPermissions(data);
      return data;
    },
    select: res => res ?? [],
    enabled: isEnabled,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: [],
  });
};
