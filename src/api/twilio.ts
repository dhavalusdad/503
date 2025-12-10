import { useMutation } from '@/api';
import { axiosDelete, axiosGet } from '@/api/axios';

const BASE_PATH = '/twilio';

interface EndSessionParams {
  roomId: string;
  appointmentId?: string;
}

export const useEndSession = () => {
  return useMutation<void, unknown, EndSessionParams>({
    mutationFn: async ({ roomId, appointmentId }) => {
      const response = await axiosDelete(`${BASE_PATH}/end-session/${roomId}/${appointmentId}`);
      return response.data;
    },
  });
};

export const getRoomDetails = async (roomId: string) => {
  const response = roomId ? await axiosGet(`${BASE_PATH}/room-details/${roomId}`) : { data: {} };
  return response.data;
};
