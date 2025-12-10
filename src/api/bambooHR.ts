import { axiosGet } from '@/api/axios';

import { useMutation } from '.';

const BASE_PATH = '/bamboohr';

export const useSyncTherapistFromBambooHR = ({
  onMutate,
  onSettled,
}: {
  onMutate?: (variables: { therapist_id: string }) => void;
  onSettled?: (variables: { therapist_id: string }) => void;
}) => {
  return useMutation({
    mutationKey: ['synced-therapist'],
    mutationFn: async ({ therapist_id }: { therapist_id: string }) => {
      const response = await axiosGet(`${BASE_PATH}/sync-therapist/${therapist_id}`);
      return response.data;
    },
    ...(onMutate && { onMutate: variables => onMutate(variables) }),
    ...(onSettled && { onSettled: (_, __, variables) => onSettled(variables) }),
    showToast: false,
  });
};
