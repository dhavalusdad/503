import { useMutation, useQuery } from '@/api';
import { axiosGet, axiosPost } from '@/api/axios';
import { amdAppointmentsTypesQueryKey } from '@/api/common/amdAppointmentsTypesQueryKey';
import { normalizeText } from '@/helper';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { mutationsQueryKey } from './common/mutations.queryKey';

interface AmdAppointmentClientPaymentParams {
  appointmentId?: string | null;
  isNewData: boolean;
}

export interface AmdAppointmentClientPayment {
  amd_insurance_balance: string;
  amd_patient_balance: string;
  amd_total_charge: string;
  amd_charge_date?: string;
}

const BASE_PATH = '/advancedmd';

export const useLookupProviders = () => {
  return useMutation({
    mutationKey: ['advancedmd-lookup-providers'],
    mutationFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/lookup-providers`);
      return response.data;
    },
    showToast: false,
  });
};

export const useGetAmdAppointmentsTypes = (params: object = {}) => {
  return useQuery({
    queryKey: amdAppointmentsTypesQueryKey.getAmdAppointmentsTypes(params),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/amd-appointment-types`, {
        params,
      });
      return response.data;
    },
  });
};

export const useSyncAmdAppointmentsTypes = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationKey: amdAppointmentsTypesQueryKey.syncAmdAppointmentsTypes(),
    mutationFn: async () => {
      const response = await axiosPost(`${BASE_PATH}/sync-appointment-types`);
      return response.data;
    },
    onSuccess: () => {
      invalidate(amdAppointmentsTypesQueryKey.getAmdAppointmentsTypes({}));
    },
  });
};

export const getAmdAppointmentsTypesAsync = async (page?: number, searchTerm?: string) => {
  try {
    const response = await axiosGet(`${BASE_PATH}/amd-appointment-types`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
      },
    });

    const amdAppointmentsTypes = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = amdAppointmentsTypes.map((item: { amd_id: string; name: string }) => ({
      value: item.amd_id,
      label: normalizeText(item.name),
    }));

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

export const useGetAmdAppointmentsClientPayment = (params?: AmdAppointmentClientPaymentParams) => {
  return useQuery<AmdAppointmentClientPayment | undefined>({
    queryKey: amdAppointmentsTypesQueryKey.getAmdAppointmentClientPayment(params),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/amd-client-appointment-details`, {
        params,
      });
      return response.data as AmdAppointmentClientPayment;
    },

    enabled: params?.isNewData,
    retry: 0,
  });
};

export const useGetAmdEhrFormById = (id: string | undefined) => {
  return useQuery({
    queryKey: amdAppointmentsTypesQueryKey.getAmdEhrForm(id),
    queryFn: () => axiosGet(`${BASE_PATH}/files/templates/${id}`),
    select: res => {
      if (res.data) {
        return res.data;
      }
      return null;
    },
    enabled: !!id,
    experimental_prefetchInRender: true,
  });
};

export const useUploadEhrDoc = () => {
  return useMutation({
    mutationKey: mutationsQueryKey.createAmdEhrForm(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}/upload-ehr-form`, { data });
      return response.data;
    },
  });
};
