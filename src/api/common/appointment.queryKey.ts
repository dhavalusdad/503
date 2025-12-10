// import type { AdminAppointmentParamsType } from '../types';

import type { AdminAppointmentParamsType } from '@/api/types/user.dto';

export const therapistQueryKeys = {
  all: ['therapists'] as const,
  search: (params?: string[] | string) =>
    ['therapists', 'search', ...(Array.isArray(params) ? params : [params])].filter(
      d => d !== undefined
    ),
  admin_appointment_list: ['admin-appointment-list'],
};

export const appointmentQueryKey = {
  clientAppointments: (clientId: string, params?: object) => [
    'clientAppointments',
    clientId,
    params,
  ],

  listDependents: (therapyType?: string) => ['userDependents', therapyType],
  getAdminAppointmentList: (params?: AdminAppointmentParamsType) => [
    therapistQueryKeys.admin_appointment_list[0],
    params,
  ],
  getLoggedData: (appointment_id: string) => ['logged-data', appointment_id],
  latestClientTherapistAppointment: (clientId: string) => [
    'latest-client-therapist-appointment',
    clientId,
  ],
  getClientTherapistAppointmentList: (params?: object) =>
    ['getClientTherapistAppointmentList', params].filter(item => item !== undefined),
};
