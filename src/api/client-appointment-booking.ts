import { useQuery } from '@/api';
import { axiosGet } from '@/api/axios.ts';
import { clientAppointmentBookingQueryKey } from '@/api/common/clientAppointment.queryKey';
import type { ClientAppointmentBookingParamsType } from '@/api/types/user.dto';

const BASE_PATH = '/appointments';

export const useGetClientAppointmentBookingList = (
  params: ClientAppointmentBookingParamsType,
  enabled: boolean = true
) => {
  const { page, limit, search, filters, timezone, sortColumn, sortOrder, columns } = params;
  const defaultData = {
    sortColumn: 'created_at',
    sortOrder: 'desc',
  };
  const modifiedData = {
    sortColumn: sortColumn || defaultData.sortColumn,
    sortOrder: sortOrder || defaultData.sortOrder,
  };
  return useQuery({
    queryKey: clientAppointmentBookingQueryKey.getClientAppointBookingList({
      ...params,
      ...modifiedData,
    }),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search || undefined,
        sortColumn: modifiedData.sortColumn,
        sortOrder: modifiedData.sortOrder,
        timezone,
        is_upcoming: params.is_upcoming,
        columns,
        ...(filters && {
          ...(filters.status?.length ? { status: filters.status.map(item => item.value) } : {}),
          ...(filters.session_types ? { session_types: [filters.session_types.value] } : {}),
          ...(filters.clinic_address ? { clinic_address: [filters.clinic_address.value] } : {}),
          ...(filters.therapy_types?.length
            ? { therapy_types: filters.therapy_types.map(item => item.value) }
            : {}),
          ...(filters.appointment_date?.startDate
            ? { startDate: filters.appointment_date?.startDate }
            : {}),
          ...(filters.appointment_date?.endDate
            ? { endDate: filters.appointment_date.endDate }
            : {}),
        }),
      };

      return await axiosGet(`${BASE_PATH}/client-appointments`, {
        params: queryParams,
      });
    },
    select: res => {
      if (res.data?.data?.length) {
        return res.data;
      }
      return {
        data: [],
        total: res.data?.total,
        currentPage: res.data?.currentPage,
      };
    },
    experimental_prefetchInRender: true,
    enabled,
  });
};
