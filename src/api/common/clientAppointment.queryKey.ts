import type { ClientAppointmentBookingParamsType } from '@/api/types/user.dto';

export const clientAppointmentBookingQueryKey = {
  getClientAppointBookingKey: (params: string) => [params],
  getClientAppointBookingList: (params?: ClientAppointmentBookingParamsType) =>
    ['getClientAppointBookingList', params].filter(item => item !== undefined),
};
