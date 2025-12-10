import { axiosGet, axiosPut } from '@/api/axios';
import type { PreferenceData } from '@/api/types/preferences.dto';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { preferenceQueryKey } from './common/preferences.queryKey';

import { useMutation, useQuery } from '.';

const BASE_PATH = '/preferences';

export const useGetPreferences = () => {
  return useQuery({
    queryKey: preferenceQueryKey.getPreferences(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/get-user-preferences`);
      return response.data as PreferenceData;
    },
  });
};

export const usePutPreferences = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (payload: { key: string; value: boolean | string }) => {
      const body = { [payload.key]: payload.value };
      const response = await axiosPut(`${BASE_PATH}/edit-preferences`, {
        data: body,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    showToast: false,
    onSuccess: () => {
      invalidate(preferenceQueryKey.getPreferences());
    },
  });
};
