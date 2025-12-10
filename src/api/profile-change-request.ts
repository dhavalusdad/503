import { useQuery } from '@/api';
import { axiosGet } from '@/api/axios.ts';
import { profileChangeRequestQueryKey } from '@/api/common/profileChangeRequest.queryKey';

const BASE_PATH = '/profile-change-request';

export const useGetProfileChangeRequest = (
  request_id?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: profileChangeRequestQueryKey.getprofileChangeRequest(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${request_id}`);
      return response.data;
    },
    enabled: options?.enabled ?? !!request_id,
  });
};
