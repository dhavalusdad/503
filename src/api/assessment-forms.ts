import { useInfiniteQuery, useMutation, useQuery } from '@/api';
import { axiosGet, axiosPut, axiosPost, axiosDelete } from '@/api/axios';
import { formsQueryKey } from '@/api/common/assessment-form.queryKey';
import {
  UserRole,
  type AssessmentFormParamsType,
  type ClientFormsParamsType,
} from '@/api/types/user.dto';
import type { FormStatusType } from '@/enums';
import type { AssignAssessmentFormDataType } from '@/features/admin/components/clientManagement/types';
import type {
  DynamicForm,
  DynamicFormResponse,
} from '@/features/admin/components/DynamicFormBuilder/types';
import { useInvalidateQuery, useRemoveQueries } from '@/hooks/data-fetching';

import type { QueryFunctionContext } from '@tanstack/react-query';

const BASE_PATH = '/forms';
const ASSIGNED_FORMS_PATH = '/user-assignment';
const FORM_RESPONSE_PATH = '/form-response';

export const useGetAssessmentFormsQuery = (params: AssessmentFormParamsType) => {
  const { page, limit, search, sortColumn, sortOrder } = params;
  const defaultData = {
    sortColumn: 'created_at',
    sortOrder: 'desc',
  };
  const modifiedData = {
    sortColumn: sortColumn || defaultData.sortColumn,
    sortOrder: sortOrder || defaultData.sortOrder,
  };
  return useQuery({
    queryKey: formsQueryKey.getList({
      ...params,
      ...modifiedData,
    }),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search ?? undefined,
        // sortColumn: modifiedData.sortColumn,
        // sortOrder: modifiedData.sortOrder,
        // timezone,
        // ...(filters && {
        //   ...(filters.created_at?.startDate ? { startDate: filters.created_at?.startDate } : {}),
        //   ...(filters.created_at?.endDate ? { endDate: filters.created_at?.endDate } : {}),
        //   ...(filters.status?.length ? { status: filters.status.map(item => item.value) } : {}),
        // }),
      };
      const result = await axiosGet(`${BASE_PATH}`, { params: queryParams });
      return result;
    },
    select: res => {
      return {
        data: res.data,
        total: res.data.total,
        currentPage: res.data.page,
      };
    },
    // placeholderData: keepPreviousData,
    // staleTime: 1000 * 60 * 60,
  });
};

export const useGetUserAssessmentForms = (params: AssessmentFormParamsType) => {
  const { page, limit, search, sortColumn, sortOrder, filters, tenant_id } = params;
  const defaultData = {
    sortColumn: 'created_at',
    sortOrder: 'desc',
  };
  const modifiedData = {
    sortColumn: sortColumn || defaultData.sortColumn,
    sortOrder: sortOrder || defaultData.sortOrder,
  };
  return useQuery({
    queryKey: formsQueryKey.getList({
      ...params,
      ...modifiedData,
    }),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search ?? undefined,
        // sortColumn: modifiedData.sortColumn,
        // sortOrder: modifiedData.sortOrder,
        // timezone,
        tenant_id,
        ...(params.appointment_id ? { appointment_id: params.appointment_id } : {}),
        ...(params.user_id ? { user_id: params.user_id } : {}),
        ...(filters && {
          //   ...(filters.created_at?.startDate ? { startDate: filters.created_at?.startDate } : {}),
          //   ...(filters.created_at?.endDate ? { endDate: filters.created_at?.endDate } : {}),
          ...(filters.status?.length ? { status: filters.status.map(item => item.value) } : {}),
          ...(filters.excludeAppointmentStatuses?.length
            ? { excludeAppointmentStatuses: filters.excludeAppointmentStatuses }
            : {}),
        }),
      };
      const result = await axiosGet(`${ASSIGNED_FORMS_PATH}/get-my-forms`, { params: queryParams });
      return result;
    },
    select: res => {
      return {
        data: res.data.data,
        total: res.data.total,
        currentPage: res.data.page,
      };
    },
  });
};

export const useGetInfiniteUserAssessmentFormsAPI = (params: AssessmentFormParamsType) => {
  const { limit, search, filters, tenant_id } = params;

  return useInfiniteQuery({
    queryKey: formsQueryKey.getList(params),
    queryFn: async (context: QueryFunctionContext<ReturnType<typeof formsQueryKey.getList>>) => {
      const pageParam = (context.pageParam as number | undefined) ?? 1;
      const queryParams = {
        page: pageParam,
        limit,
        search: search ?? undefined,
        tenant_id,
        ...(params.include_dependent ? { include_dependent: params.include_dependent } : {}),
        ...(params.user_id ? { user_id: params.user_id } : {}),
        ...(params.appointment_id ? { appointment_id: params.appointment_id } : {}),
        ...(filters && {
          ...(filters.status?.length ? { status: filters.status.map(item => item.value) } : {}),
        }),
      };
      const result = await axiosGet(`${ASSIGNED_FORMS_PATH}/get-my-forms`, { params: queryParams });
      const currentPage = result.data?.page ?? pageParam;
      const items = result.data?.data ?? [];
      const total = result.data?.data.total ?? 0;
      const pageSize =
        (limit && Number(limit)) || (Array.isArray(items.data) ? items.data.length : 0) || 20;
      return {
        data: items,
        total,
        currentPage,
        hasMore:
          Array.isArray(items.data) && items.data.length > 0 && currentPage * pageSize < total,
      };
    },
    gcTime: 0,
    getNextPageParam: lastPage => {
      if (!lastPage?.hasMore) return undefined;
      return (Number(lastPage.currentPage) || 1) + 1;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: params.role === UserRole.CLIENT,
    refetchOnReconnect: params.role === UserRole.CLIENT,
    enabled: !!params.appointment_id,
  });
};

export const useUpdateAssessmentFormRequest = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({ data, id }: { data: DynamicForm; id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(formsQueryKey.getListData());
    },
  });
};

export const useGetAssessmentFormDetails = (formId: string) => {
  return useQuery({
    queryKey: formsQueryKey.getFormById(formId),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${formId}`);
      return response.data;
    },
    enabled: !!formId,
  });
};

export const useCreateAssessmentForms = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: DynamicForm) => {
      const response = await axiosPost(`${BASE_PATH}`, { data });
      if (response.status === 203) {
        return response;
      }
      return response.data;
    },
    onSuccess: () => {
      invalidate(formsQueryKey.getListData());
    },
    showToast: false,
  });
};

export const useGetClientsAssessmentForms = (params: ClientFormsParamsType) => {
  const { page, limit, search, user_id, filters, appointment_id, therapistId } = params;
  return useQuery({
    queryKey: formsQueryKey.getFormsByUserId(params),
    queryFn: async () => {
      const queryParams = {
        user_id: user_id,
        therapistId: therapistId,
        appointment_id: appointment_id,
        include_dependent: true,
        page,
        limit,
        search,
        ...(filters && {
          //   ...(filters.created_at?.startDate ? { startDate: filters.created_at?.startDate } : {}),
          //   ...(filters.created_at?.endDate ? { endDate: filters.created_at?.endDate } : {}),
          ...(filters.status?.length ? { status: filters.status.map(item => item.value) } : {}),
        }),
      };
      const response = await axiosGet(`${ASSIGNED_FORMS_PATH}/get-user-assigned`, {
        params: queryParams,
      });
      return response.data;
    },
    enabled: !!user_id,
  });
};

export const useGetInfinitePendingClientsAssessmentForms = (params: {
  status?: FormStatusType[];
  therapistId?: string;
}) => {
  const { therapistId, status } = params;
  return useInfiniteQuery({
    queryKey: formsQueryKey.getFormsByUserId(params?.therapistId),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const queryParams = {
        therapistId: therapistId,
        page: pageParam,
        limit: 10,
        ...(status ? { status } : {}),
      };
      const response = await axiosGet(`${ASSIGNED_FORMS_PATH}/get-user-assigned`, {
        params: queryParams,
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
  });
};

export const useAssignFormToClient = (user_id: string) => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: AssignAssessmentFormDataType) => {
      const response = await axiosPost(`${ASSIGNED_FORMS_PATH}/assign`, { data });
      if (response.status === 203) return response;
      return response.data;
    },
    onSuccess: () => {
      // invalidate only this user's assigned forms
      invalidate(formsQueryKey.getFormsByUserId({ user_id, limit: 10, page: 1, filters: {} }));
    },
    showToast: true,
  });
};

export const useCreateFormResponse = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: DynamicFormResponse) => {
      const response = await axiosPost(`${FORM_RESPONSE_PATH}/submit`, { data });
      if (response.status === 203) {
        return response;
      }
      return response.data;
    },
    onSuccess: () => {
      invalidate(formsQueryKey.getListData());
    },
    showToast: true,
  });
};

export const useUpdateFormCategory = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({ data, id }: { data: { category: string }; id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/update-category/${id}`, { data });
      if (response.status === 203) {
        return response;
      }
      return response.data;
    },
    onSuccess: () => {
      invalidate(formsQueryKey.getList());
    },
    showToast: true,
  });
};

export const useUpdateFormResponse = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: DynamicFormResponse) => {
      const response = await axiosPost(`${FORM_RESPONSE_PATH}/update-response/${data.id}`, {
        data,
      });
      if (response.status === 203) {
        return response;
      }
      return response.data;
    },
    onSuccess: () => {
      invalidate(formsQueryKey.getListData());
    },
    showToast: true,
  });
};

export const useGetUserFormResponse = (Id: string) => {
  return useQuery({
    queryKey: formsQueryKey.getFormResponseById(Id),
    queryFn: async () => {
      const response = await axiosGet(`${FORM_RESPONSE_PATH}/${Id}`);
      return response.data;
    },
    enabled: !!Id,
    refetchOnMount: true,
  });
};

export const useDeleteAssignmentById = () => {
  const { removeQueries } = useRemoveQueries();

  return useMutation({
    mutationKey: formsQueryKey.deleteAssignedForm(),
    mutationFn: async (id: string) => {
      const response = await axiosDelete(`${ASSIGNED_FORMS_PATH}/${id}`);

      return response.data;
    },
    onSuccess: () => {
      removeQueries();
    },
    showToast: true,
  });
};

export const useGetAssignedForm = (params: { formAssignedId: string; token: string }) => {
  const { formAssignedId, token } = params;
  return useQuery({
    queryKey: formsQueryKey.getFormById(formAssignedId),
    queryFn: async () => {
      const response = await axiosGet(`${ASSIGNED_FORMS_PATH}/form/${formAssignedId}`, {
        params: {
          token,
        },
      });
      return response.data;
    },
    enabled: !!formAssignedId,
  });
};

export const useSubmitAssignedForm = ({
  token,
  onSuccess,
}: {
  token: string;
  onSuccess?: () => void;
}) => {
  return useMutation({
    mutationFn: async (data: DynamicFormResponse) => {
      const response = await axiosPost(`${ASSIGNED_FORMS_PATH}/submit-form/${data.id}`, {
        data: { ...data, token },
      });

      return response.data;
    },
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    showToast: true,
  });
};

export const useUploadFormFile = () => {
  return useMutation({
    mutationFn: async (file: File[]) => {
      const formData = new FormData();

      file.forEach(f => formData.append('form_file', f));

      const response = await axiosPost(`${FORM_RESPONSE_PATH}/upload-form-file`, {
        data: formData,
      });

      return response.data.data;
    },
    showToast: true,
  });
};

export const getAssessmentFormsAsync = async (
  page?: number,
  limit?: number,
  searchTerm?: string
) => {
  try {
    const defaultSort = {
      sortColumn: 'created_at',
      sortOrder: 'desc',
    };

    const response = await axiosGet(`${BASE_PATH}`, {
      params: {
        page: page || 1,
        limit: limit || 10,
        ...(searchTerm ? { search: searchTerm } : {}),
        sortColumn: defaultSort.sortColumn,
        sortOrder: defaultSort.sortOrder,
      },
    });

    const forms = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = forms.map((item: { id: string; name: string }) => ({
      value: item.id,
      label: item.name,
    }));

    return {
      data: transformedData,
      hasMore,
    };
  } catch {
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useGetTreatmentProgressAnalytics = (params: {
  client_id: string;
  therapist_id: string;
}) => {
  return useQuery({
    queryKey: formsQueryKey.getTreatmentList({ params }),
    queryFn: async () => {
      const queryParams = {
        client_id: params.client_id,
        therapist_id: params.therapist_id,
      };
      const result = await axiosGet(`${FORM_RESPONSE_PATH}/analytics/treatment-progress`, {
        params: queryParams,
      });
      return result;
    },
    select: res => {
      return {
        data: res.data,
      };
    },
  });
};
