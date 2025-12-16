import { useMutation, useQuery } from '@/api';
import { axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { insuranceQueryKey } from '@/api/common/insurance';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { InsuranceType } from '@/pages/Preferences/components/AddInsuranceModal';

const BASE_PATH = '/insurance';
const USER_PATH = '/user';

export interface InsuranceData {
  id: string;
  carrier: {
    id: string;
    carrier_code: string;
    carrier_name: string;
  };
  begin_date: string;
  end_date: string;
  is_added_to_amd: boolean;
  member_id: string;
  is_active: boolean;
  insurance_type: InsuranceType;
  group_id?: string;
  is_pverify_verified?: boolean;
  first_name?: string;
  last_name?: string;
}

export const useGetClientInsurances = (clientId?: string) => {
  return useQuery({
    queryKey: insuranceQueryKey.getClientInsurances(clientId),
    queryFn: async (): Promise<InsuranceData[]> => {
      const response = await axiosGet(`${BASE_PATH}/client/${clientId}`);
      return response.data;
    },
    enabled: !!clientId,
  });
};

export interface InsuranceStatusResponse {
  has_insurance: boolean;
}

export const useGetUserInsuranceStatus = (enabled = true) => {
  return useQuery({
    queryKey: insuranceQueryKey.getUserInsuranceStatus(),
    queryFn: async (): Promise<InsuranceStatusResponse> => {
      const response = await axiosGet(`${USER_PATH}/insurance-status`);
      return response.data;
    },
    enabled,
  });
};

// Get all available insurances
export const useGetAllInsurances = () => {
  return useQuery({
    queryKey: insuranceQueryKey.getAllInsurances(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}`);
      return response.data;
    },
  });
};

// Async function to get all insurances for CustomAsyncSelect
export const getAllInsurancesAsync = async (_page?: number, searchTerm?: string) => {
  try {
    const response = await axiosGet(`${BASE_PATH}`);
    const insurances = response?.data?.data || [];

    // Filter by search term if provided
    const filteredInsurances = searchTerm
      ? insurances.filter((insurance: InsuranceData) =>
          insurance.carrier?.carrier_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : insurances;

    const transformedData = filteredInsurances.map((insurance: { id: string; name: string }) => ({
      label: insurance.name,
      value: insurance.id,
    }));

    return {
      data: transformedData,
      hasMore: false,
    };
  } catch (error) {
    console.error('Failed to get all insurances:', error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

// Create new insurance
export interface CreateInsurancePayload {
  client_id: string;
  carrier_code: string;
  carrier_name: string;
  member_id: string;
  group_id?: string;
  first_name: string;
  last_name: string;
  insurance_type: InsuranceType;
}

export interface UpdateInsurancePayload {
  is_active?: boolean;
  insurance_type?: InsuranceType;
  group_id?: string;
  first_name?: string;
  last_name?: string;
}

export const useCreateInsurance = (clientId?: string, appointmentId?: string) => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateInsurancePayload) => {
      const response = await axiosPost(`${BASE_PATH}`, { data });
      return response.data;
    },
    showToast: true,
    onSuccess: () => {
      invalidate(insuranceQueryKey.getClientInsurances(clientId));
      invalidate(insuranceQueryKey.getUserInsuranceStatus());
      invalidate(insuranceQueryKey.getInsurancesNotInAppointment(appointmentId));
    },
  });
};
export const useUpdateInsurance = (clientId?: string) => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({ data, id }: { data: UpdateInsurancePayload; id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    showToast: true,
    onSuccess: () => {
      invalidate(insuranceQueryKey.getClientInsurances(clientId));
      invalidate(insuranceQueryKey.getUserInsuranceStatus());
    },
  });
};

// Async function for CustomAsyncSelect (no pagination, returns all data)
export const getClientInsurancesAsync = async (
  _page?: number,
  searchTerm?: string,
  clientId?: string
) => {
  try {
    const response = await axiosGet(`${BASE_PATH}/client/${clientId}`);
    const insurances = response?.data?.data || [];

    // Filter by search term if provided
    const filteredInsurances = searchTerm
      ? insurances.filter((insurance: InsuranceData) =>
          insurance.carrier?.carrier_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : insurances;

    const transformedData = filteredInsurances.map((insurance: InsuranceData) => ({
      label: insurance.carrier?.carrier_name,
      value: insurance.id,
    }));

    return {
      data: transformedData,
      hasMore: false, // No pagination
    };
  } catch (error) {
    console.error('Failed to get client insurances:', error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

// Get insurances not added to appointment
export const useGetInsurancesNotInAppointment = (appointmentId?: string) => {
  return useQuery({
    queryKey: insuranceQueryKey.getInsurancesNotInAppointment(appointmentId),
    queryFn: async (): Promise<{ insurances: InsuranceData[]; clientId: string }> => {
      const response = await axiosGet(`${BASE_PATH}/appointment/${appointmentId}/not-added`);
      return response.data;
    },
    enabled: !!appointmentId,
  });
};

// Add insurances to appointment
export interface AddInsurancesToAppointmentPayload {
  insurance_ids: string[];
}

export const useAddInsurancesToAppointment = (appointmentId?: string) => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (payload: AddInsurancesToAppointmentPayload) => {
      const response = await axiosPost(`${BASE_PATH}/appointment/${appointmentId}/add-active`, {
        data: payload,
      });
      return response.data;
    },
    showToast: true,
    onSuccess: () => {
      invalidate(calendarQueryKeys.appointmentsDetail(appointmentId));
    },
  });
};

// Onboarding insurance - create multiple insurances and assign to appointments
export interface OnboardingInsurancePayload {
  client_id: string;
  insurances: {
    id: string;
    carrier: {
      label: string;
      value: string;
    };
    member_id: string;
  }[];
}
