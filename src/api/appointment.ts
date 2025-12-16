import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';

import { useInfiniteQuery, useMutation, useQuery, type CustomUseQueryOptions } from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { appointmentQueryKey, therapistQueryKeys } from '@/api/common/appointment.queryKey';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { clientAppointmentBookingQueryKey } from '@/api/common/clientAppointment.queryKey';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { userQueryKey } from '@/api/common/user.queryKey';
import type {
  AdminAppointmentParamsType,
  CreateBookingAppointmentResponse,
  EndAppointmentDataType,
  GetAppointmentsRequest,
  TherapistAppointmentLoggedDataResponse,
  UpdateAppointmentLoggedTimePayloadType,
  UpdateAppointmentRequest,
  UserDependentResponse,
} from '@/api/types/calendar.dto';
import type { ApiResponse } from '@/api/types/common.dto';
import type { InfiniteAppointmentPageResponse } from '@/api/types/therapist.dto';
import { isDefined } from '@/api/utils';
import { TherapyType } from '@/enums';
import type {
  CreateBookingAppointmentRequest,
  CreateBookingAppointmentRequestClient,
} from '@/features/calendar/types';
import { useInvalidateQuery } from '@/hooks/data-fetching';

const BASE_PATH = '/appointments';

export const useGetAppointments = (
  params?: GetAppointmentsRequest,
  options?: CustomUseQueryOptions
) => {
  const timezone = params?.timezone || params?.timeZone;
  const startDate = params?.startDate || params?.filters?.appointment_date?.startDate;
  const endDate = params?.endDate || params?.filters?.appointment_date?.endDate;
  return useQuery({
    queryKey: calendarQueryKeys.appointments(params),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/therapist-appointments`, {
        params: {
          includeCancelled: params?.includeCancelled || false,
          ...(params?.page ? { page: params?.page } : {}),
          ...(params?.limit ? { limit: params?.limit } : {}),
          ...(params?.search ? { search: params?.search } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          ...(timezone ? { timezone } : {}),
          ...(params?.sortColumn ? { sortColumn: params?.sortColumn } : {}),
          ...(params?.sortOrder ? { sortOrder: params?.sortOrder } : {}),
          ...(params?.therapist_id ? { therapist_id: params?.therapist_id } : {}),
          ...(params?.status?.length ? { status: params?.status } : {}),
          ...(params?.filters && {
            ...(params?.filters.status
              ? {
                  status: params?.filters.status.map(item => item.value),
                }
              : {}),
            ...(params?.filters.payment_method
              ? {
                  payment_method: JSON.stringify(
                    params?.filters.payment_method.map(item => item.value)
                  ),
                }
              : {}),
            ...(params?.filters.therapy_type
              ? {
                  therapy_type: JSON.stringify(
                    params?.filters.therapy_type.map(item => item.value)
                  ),
                }
              : {}),
          }),
        },
      });
      return response.data;
    },
    enabled: isDefined(options?.enabled) ? options.enabled : true,
  });
};

export const useGetAppointmentDetails = (appointmentId: string) => {
  return useQuery({
    queryKey: calendarQueryKeys.appointmentsDetail(appointmentId),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${appointmentId}`);
      return response.data;
    },
    enabled: !!appointmentId,
  });
};

export const useCancelTherapistAppointment = ({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: () => void;
}) => {
  return useMutation({
    mutationKey: mutationsQueryKey.cancelAppointment(),
    mutationFn: async ({
      id,
      reason,
      cancellationScope,
    }: {
      id: string;
      reason: string;
      cancellationScope: string;
    }) => {
      const response = await axiosDelete(`${BASE_PATH}/therapist/${id}/cancel`, {
        data: {
          cancellation_reason: reason,
          cancel_scope: cancellationScope,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      if (onError) {
        onError();
      }
    },
    showToast: true,
  });
};

export const useCancelClientAppointment = () => {
  // const queryClient = useQueryClient();

  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationKey: ['cancel-appointment'],
    mutationFn: async ({
      id,
      reason,
      cancellationScope,
    }: {
      id: string;
      reason: string;
      cancellationScope: string;
    }) => {
      const response = await axiosDelete(`${BASE_PATH}/client/${id}/cancel`, {
        data: {
          cancellation_reason: reason,
          cancel_scope: cancellationScope,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate(clientAppointmentBookingQueryKey.getClientAppointBookingList());
    },
    showToast: true,
  });
};

export const useGetAdminAppointments = (params: AdminAppointmentParamsType) => {
  const { page, limit, search, filters, timezone, sortColumn, sortOrder } = params;
  const defaultData = {
    sortColumn: 'created_at',
    sortOrder: 'desc',
  };
  const modifiedData = {
    sortColumn: sortColumn || defaultData.sortColumn,
    sortOrder: sortOrder || defaultData.sortOrder,
  };

  return useQuery({
    queryKey: appointmentQueryKey.getAdminAppointmentList({
      ...params,
      ...modifiedData,
    }),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search ?? undefined,
        sortColumn: modifiedData.sortColumn,
        sortOrder: modifiedData.sortOrder,
        timezone,
        ...(filters && {
          ...(filters?.appointment_date?.startDate
            ? { startDate: filters.appointment_date.startDate }
            : {}),
          ...(filters?.appointment_date?.endDate
            ? { endDate: filters.appointment_date.endDate }
            : {}),
          ...(Array.isArray(filters?.status) && filters.status.length > 0
            ? {
                status: JSON.stringify(filters.status.map(item => item.value)),
              }
            : {}),
          ...(Array.isArray(filters?.therapy_type) && filters.therapy_type.length > 0
            ? { therapy_type: JSON.stringify(filters.therapy_type.map(el => el.value)) }
            : {}),
          ...(Array.isArray(filters?.session_type) && filters.session_type.length > 0
            ? { session_type: JSON.stringify(filters.session_type.map(el => el.value)) }
            : {}),
          ...(Array.isArray(filters?.therapists) && filters.therapists.length > 0
            ? { therapist_ids: JSON.stringify(filters.therapists.map(el => el.value)) }
            : {}),
        }),
      };
      const response = await axiosGet(`${BASE_PATH}/admin-appointments`, {
        params: queryParams,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useCreateBookingAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: CreateBookingAppointmentRequest
    ): Promise<ApiResponse<CreateBookingAppointmentResponse>> => {
      const response = await axiosPost(`${BASE_PATH}/therapist-appointment`, {
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.appointments({}) });
      queryClient.invalidateQueries({ queryKey: calendarQueryKeys.availabilitySlots({}) });
      queryClient.invalidateQueries({ queryKey: userQueryKey.getPatientList() });
      queryClient.clear();
    },
    showToast: false,
  });
};

export const useUpdateAppointment = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationFn: async ({ data, id }: { data: UpdateAppointmentRequest; id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    onSuccess: async () => {
      if (onSuccess) {
        await onSuccess();
      }
    },
  });
};

export const useGetAppointmentHistory = (clientId: string, params?: object) => {
  return useQuery({
    queryKey: appointmentQueryKey.clientAppointments(clientId, params),
    queryFn: async () => {
      const res = await axiosPost(`${BASE_PATH}/history/${clientId}`, { data: params });
      return res.data;
    },
    enabled: !!clientId,
  });
};

interface AppointmentInfo {
  appointment_date: Date;
  id: string;
  status: string;
  therapist_name: string;
}

export const getAppointmentHistoryAsync = async (
  timezone: string,
  page?: number,
  searchTerm?: string,
  clientId?: string
): Promise<{ data: { label: string; value: string }[]; hasMore: boolean } | null> => {
  try {
    const params: Record<string, string | number | string[]> = {
      page: page || 1,
      limit: 10,
      columns: ['id', 'therapist_name', 'date', 'status', 'therapy_name'],
      status: ['Scheduled', 'Rescheduled', 'InProgress'],
    };
    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }
    const response = await axiosPost(`${BASE_PATH}/history/${clientId}`, { data: params });

    const data = response.data.data?.data || [];

    const transformedData = data.map((appointment: AppointmentInfo) => {
      return {
        label: `${appointment.therapist_name} ${moment.tz(appointment.appointment_date, timezone).format('MMM D, YYYY, h:mm A')} (${appointment?.therapy_name})`,
        value: appointment.id,
        data: appointment,
      };
    });

    return {
      data: transformedData,
      hasMore: response.data.data?.hasMore || false,
    };
  } catch (error) {
    console.error(`Failed to get appointment history:`, error);
    return null;
  }
};

export const useUpdateAppointmentAdmin = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({ data, id }: { data: UpdateAppointmentRequest; id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(therapistQueryKeys.admin_appointment_list);
    },
  });
};

export const useCreateClientAppointmentBooking = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateBookingAppointmentRequestClient) => {
      const response = await axiosPost(`${BASE_PATH}/client-appointment`, { data });
      if (response.status === 203) {
        return response;
      }
      return response.data;
    },
    onSuccess: () => {
      invalidate(therapistQueryKeys.admin_appointment_list);
      invalidate(calendarQueryKeys.clientTherapistAppointments({}));
      invalidate(appointmentQueryKey.clientAppointments('', {}));
    },
    showToast: false,
  });
};

export const useCreateAdminAppointmentBooking = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateBookingAppointmentRequestClient) => {
      const response = await axiosPost(`${BASE_PATH}/appointment-admin`, { data });
      if (response.status === 203) {
        return response;
      }
      return response.data;
    },
    onSuccess: () => {
      invalidate(therapistQueryKeys.admin_appointment_list);
      invalidate(calendarQueryKeys.clientTherapistAppointments({}));
      invalidate(appointmentQueryKey.clientAppointments('', {}));
    },
    showToast: false,
  });
};

export const useGetUserDependents = (therapyType?: string, patient_id?: string) => {
  return useQuery({
    queryKey: [appointmentQueryKey.listDependents(therapyType)],
    queryFn: async (): Promise<UserDependentResponse[]> => {
      const params = {
        therapy_type: [therapyType],
        ...(patient_id ? { client_id: patient_id } : {}),
      };
      const response = await axiosGet(`/user-dependent`, {
        params,
      });
      return response.data.data;
    },

    enabled: !!therapyType,
  });
};

export const useGetAppointmentDetailsByVideoRoom = (videoRoomName: string) => {
  return useQuery({
    queryKey: calendarQueryKeys.appointmentsDetail(videoRoomName),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/video-room/${videoRoomName}`);
      return response.data;
    },
    enabled: !!videoRoomName,
  });
};

// Async function for infinite scrolling
export const getClientAppointmentsAsync = async (
  page?: number,
  searchTerm?: string,
  clientId?: string,
  timezone?: string
) => {
  try {
    const today = moment.tz(timezone);
    const endDate = today.clone().add(1, 'day').format('YYYY-MM-DD');
    const startDate = today.clone().subtract(7, 'days').format('YYYY-MM-DD');
    const params: Record<string, string | number> = {
      page: page || 1,
      limit: 10,
      startDate,
      endDate,
      includeCancelled: 'false',
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }

    const response = await axiosGet(`${BASE_PATH}/client-therapist-appointments`, {
      params: {
        ...params,
        client_id: clientId,
        order: 'DESC',
      },
    });

    let appointments = [];
    let hasMore = false;

    appointments = response?.data?.data?.data || [];
    hasMore = response.data?.data?.hasMore || false;

    const transformedData = appointments.map(appointment => {
      const clientName = `${appointment.client.user.first_name} ${appointment.client.user.last_name}`;
      const startTime = timezone
        ? moment.tz(appointment.slot.start_time, timezone).format('MMM D, YYYY, h:mm A')
        : moment(appointment.slot.start_time).format('MMM D, YYYY, h:mm A');
      const therapyType = appointment.therapy_type.name;
      const status = appointment.status;

      return {
        value: appointment.id,
        label: `${clientName} - ${startTime} - ${therapyType} (${status})`,
        data: appointment,
      };
    });
    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (e) {
    console.error('Failed to get client appointments:', e);
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useGetAppointmentLoggedData = (appointment_id: string) => {
  return useQuery({
    queryKey: appointmentQueryKey.getLoggedData(appointment_id),
    queryFn: async (): Promise<TherapistAppointmentLoggedDataResponse> => {
      const response = await axiosGet(`${BASE_PATH}/${appointment_id}/logged-data`);
      return response.data;
    },
    enabled: !!appointment_id,
  });
};

export const useUpdateTherapistAppointmentLoggedTime = () => {
  return useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      data: UpdateAppointmentLoggedTimePayloadType;
      id: string;
    }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}/logged-data`, { data });
      return response.data;
    },
  });
};

export const useEndAppointmentAPI = () => {
  return useMutation({
    mutationFn: async ({ data, id }: { data: EndAppointmentDataType; id: string }) => {
      const response = await axiosPost(`${BASE_PATH}/${id}/end-session`, { data });
      return response.data;
    },
  });
};
export const getDependentUserByClientId = async (
  page?: number,
  searchTerm?: string,
  clientId?: string,
  therapy_type?: string | string[]
) => {
  try {
    const params: Record<string, string | number> = {
      page: page || 1,
      limit: 10,
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }
    const therapy = {
      [TherapyType.FAMILY]: 'Family',
      [TherapyType.COUPLE]: 'Couple',
      [TherapyType.MINOR]: 'Minor',
      [TherapyType.ALL]: 'All',
    };

    const response = await axiosGet(`/user-dependent`, {
      params: {
        ...params,
        therapy_type: Array.isArray(therapy_type)
          ? therapy_type?.map(d => therapy?.[d])
          : [therapy[therapy_type]],
        client_id: clientId,
      },
    });

    let dependentList = [];
    const hasMore = 10 * (page || 1) < response?.data.data.total;

    dependentList = response?.data.data.data || [];
    const transformedData = dependentList.map((user: UserDependentResponse) => {
      return {
        value: user.user_id,
        label: `${user.user.first_name} ${user.user.last_name}`,
        data: user,
      };
    });

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch {
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useGetLatestClientTherapistAppointment = <T>(client_id: string) => {
  return useQuery({
    queryKey: appointmentQueryKey.latestClientTherapistAppointment(client_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/latest/${client_id}`);
      return response.data as T;
    },
  });
};

export const getTherapistAppointmentsAsync = async (
  page?: number,
  searchTerm?: string,
  timezone?: string
) => {
  try {
    const params: Record<string, string | number> = {
      page: page || 1,
      limit: 10,
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }

    const response = await axiosGet(`${BASE_PATH}/client-therapist-appointments`, {
      params: {
        ...params,
        ...(timezone ? { timezone: timezone } : {}),
      },
    });

    let appointments = [];
    let hasMore = false;

    appointments = response?.data?.data?.data || [];
    hasMore = response.data?.data?.hasMore || false;

    return {
      data: appointments,
      hasMore: hasMore,
    };
  } catch (e) {
    console.error('Failed to get client appointments:', e);
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useInfiniteTherapistAppointmentQuery = (param?: {
  timezone: string;
  filter: string | number;
}) => {
  return useInfiniteQuery<InfiniteAppointmentPageResponse>({
    queryKey: appointmentQueryKey.getClientTherapistAppointmentList({ param }),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosGet(`${BASE_PATH}/client-therapist-appointments`, {
        params: {
          ...param,
          page: pageParam,
          limit: 10,
        },
      });
      const pageData = res.data.data.data || [];
      const total = res.data.data.total || 0;

      return {
        data: pageData,
        total,
        hasMore: res.data.data.hasMore,
      };
    },
    gcTime: 100,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + (page.data?.length || 0), 0);
      const total = allPages[0]?.total || 0;
      // Continue if more items expected or hasMore is true
      if (totalFetched < total || lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchOnMount: true,
  });
};

export const useCancelAppointmentExternalAccess = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationKey: mutationsQueryKey.cancelAppointment(),
    mutationFn: async ({
      id,
      token,
      reason,
      cancellationScope,
    }: {
      id: string;
      token: string;
      reason: string;
      cancellationScope: string;
    }) => {
      const response = await axiosDelete(`${BASE_PATH}/external-access/client/${id}/cancel`, {
        data: {
          token,
          cancellation_reason: reason,
          cancel_scope: cancellationScope,
        },
      });
      return response.data;
    },
    onSuccess: async () => {
      if (onSuccess) {
        onSuccess();
      }
    },
    showToast: true,
  });
};

export const useGetAppointmentDetailsExternalAccess = (appointmentId: string, token: string) => {
  return useQuery({
    queryKey: calendarQueryKeys.appointmentsDetail(appointmentId),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/external-access/${appointmentId}`, {
        params: { token },
      });
      return response.data;
    },
    enabled: !!appointmentId,
  });
};
