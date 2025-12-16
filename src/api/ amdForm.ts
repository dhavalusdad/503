import { useQuery, useQueryClient, type QueryFunctionContext } from '@tanstack/react-query';

import { axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { amdFormQueryKeys } from '@/api/common/amd.query';
import { useInfiniteQuery, useMutation } from '@/api/index';
import type {
  AssignAmdAppointmentId,
  CreateAmdIntakeForm,
  GetAmdFormRequest,
  GetAmdFormResponse,
  ProblemListItem,
  UpdateAmdIntakeFormRequest,
} from '@/api/types/amd.dto';
import type { ApiResponse } from '@/api/types/common.dto';
import type { FormStatusAMD } from '@/features/dashboard/components/IncompleteClincalNotes';

const BASE_PATH = '/amd-form';

export const useCreateAmdIntakeForm = ({ close }: { close: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAmdIntakeForm) => {
      const response = await axiosPost(`${BASE_PATH}/response`, {
        data,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific form query
      queryClient.invalidateQueries({
        queryKey: amdFormQueryKeys.unsignedForms(variables.patient_id, {}),
      });
      close();
    },
    showToast: true,
  });
};

export const useUpdateAmdIntakeFormResponse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateAmdIntakeFormRequest) => {
      const response = await axiosPut(`${BASE_PATH}/response/${data.note_id}`, {
        data: {
          form_name: data.form_name || '',
          amd_appointment_id: data.amd_appointment_id || '',
          patient_id: data.patient_id || '',
          therapist_id: data.therapist_id || '',
          response_json: data.response_json || [],
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate calendar queries
      // Invalidate specific form query

      queryClient.invalidateQueries({
        queryKey: amdFormQueryKeys.unsignedForms(variables.patient_id, {}),
      });
    },
    showToast: true,
  });
};

export const useGetAmdForm = (params: GetAmdFormRequest) => {
  return useQuery({
    queryKey: amdFormQueryKeys.form(params.formName),
    queryFn: async (): Promise<ApiResponse<GetAmdFormResponse>> => {
      const response = await axiosGet(`${BASE_PATH}/get-form`, {
        params: { formName: params.formName },
      });
      return response.data;
    },
    enabled: !!params.formName,
  });
};

export const useGetFormValue = ({
  patientId,
  templateId,
  ehrNoteId,
  clientId,
  therapist_id,
  user_id,
}: {
  patientId: string;
  templateId: string;
  ehrNoteId: string;
  clientId: string;
  therapist_id: string;
  user_id: string;
}) => {
  return useQuery({
    queryKey: amdFormQueryKeys.formValue(patientId),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/ehr-notes`, {
        params: { patientId, templateId, ehrNoteId, clientId, therapist_id, user_id },
      });
      return response.data;
    },
    enabled: !!patientId && !!ehrNoteId && !!templateId,
  });
};

export const useGetUnsignedForms = (
  therapistId: string,
  client_id: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortColumn?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
  return useQuery({
    queryKey: amdFormQueryKeys.unsignedForms(client_id, params),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/therapist/unsigned-forms/${therapistId}`, {
        params: {
          client_id,
          ...(params?.page ? { page: params.page } : {}),
          ...(params?.limit ? { limit: params.limit } : {}),
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortColumn ? { sortColumn: params.sortColumn } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      });

      const responseData = response.data;
      if (responseData?.data) {
        return {
          data: responseData.data.data || [],
          total: responseData.data.total || 0,
          currentPage: params?.page || 1,
        };
      }

      return {
        data: [],
        total: 0,
        currentPage: params?.page || 1,
      };
    },
    enabled: !!therapistId,
  });
};

export const useGetInfiniteUnsignedForms = ({
  therapistId,
  appointmentId,
  status,
}: {
  therapistId: string;
  appointmentId?: string;
  status?: FormStatusAMD[];
}) => {
  return useInfiniteQuery({
    queryKey: amdFormQueryKeys.infiniteUnsignedForms(therapistId, appointmentId, status?.join(',')),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}/therapist/unsigned-forms/${therapistId}`, {
        params: {
          page: pageParam,
          limit: 10,
          ...(status?.length ? { status } : {}),
          ...(appointmentId ? { appointment_id: appointmentId } : {}),
        },
      });

      const payload = response.data;
      const items = payload?.data?.data ?? [];

      const total = payload?.data?.total ?? 0;
      return {
        items,
        nextPage: pageParam * 10 < total ? pageParam + 1 : undefined,
        total,
      };
    },
    gcTime: 0,
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
    enabled: !!therapistId,
  });
};

export const useGetAllAmdForms = () => {
  return useQuery({
    queryKey: amdFormQueryKeys.allForms(),
    queryFn: async (): Promise<ApiResponse<GetAmdFormResponse>> => {
      const response = await axiosGet(`${BASE_PATH}/get-all`);
      return response.data;
    },
  });
};

export const useAssignAmdForm = ({ close }: { close: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AssignAmdAppointmentId) => {
      const response = await axiosPost(`${BASE_PATH}/assign`, {
        data: {
          client_id: data.patient_id,
          form_id: data.form_id,
          appointment_id: data.appointment_id,
        },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific form query
      queryClient.invalidateQueries({
        queryKey: amdFormQueryKeys.unsignedForms(variables.patient_id, {}),
      });

      close();
    },
  });
};

export const useGetProblemList = (clientId?: string) => {
  return useQuery({
    queryKey: amdFormQueryKeys.problemList(clientId),
    queryFn: async (): Promise<ApiResponse<ProblemListItem[]>> => {
      const params: Record<string, string> = {};
      if (clientId) params.client_id = clientId;
      const response = await axiosGet(`${BASE_PATH}/problem-list`, {
        params,
      });
      return response.data;
    },
    enabled: !!clientId,
  });
};
