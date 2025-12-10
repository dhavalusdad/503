import { useQueryClient } from '@tanstack/react-query';

import { PERMISSION_QUERY_KEYS_NAME } from '@/api/common/permissions.queryKey';

export const useInvalidatePermissionData = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: [PERMISSION_QUERY_KEYS_NAME.GET_USER_PERMISSION],
    });
  };
};
