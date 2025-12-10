import { axiosGet, axiosPost, axiosPut } from '@/api/axios.ts';
import { isDefined } from '@/api/utils';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { agreementQueryKey } from './common/agreement.queryKey';
import { CLIENT_KEYS_NAME } from './common/client.queryKey';
import { STAFF_KEYS_NAME } from './common/staff.queryKey';
import { THERAPIST_KEYS_NAME } from './common/therapist.queryKey';
import { USER_KEYS_NAME, userQueryKey } from './common/user.queryKey';

import {
  useMutation,
  useQuery,
  type CustomUseMutationOptions,
  type UseQueryRestParamsType,
} from '.';

import type { ApiResponse } from './types/common.dto';
import type {
  CreatePatientRequest,
  CreatePatientResponse,
  GetPatientListRequest,
  Patient,
  PatientData,
  TherapistClientListParamsType,
  UserRole,
} from './types/user.dto';
import type { AxiosError } from 'axios';

const BASE_PATH = '/user';
const THERAPIST_BASE_PATH = '/therapist';
const CLIENT_BASE_PATH = '/client';

export const useUploadUserProfilePicture = (payload: {
  options?: CustomUseMutationOptions<ApiResponse<{ path: string }>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options, extraParams } = payload;
  return useMutation({
    mutationFn: async data => {
      const response = await axiosPut(`${BASE_PATH}/upload`, {
        data,
      });
      return response.data;
    },
    ...options,
    ...extraParams,
  });
};

export const useUpdateUser = (payload: {
  options?: CustomUseMutationOptions<ApiResponse<Response>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options, extraParams } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async data => {
      const response = await axiosPut(`${BASE_PATH}/update`, {
        data,
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate(userQueryKey.useGetUserProfile());
      invalidate(userQueryKey.getUserDetails());
    },
  });
};

export const useUpdateUserAgreement = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/sign-agreement/${id}`, {});
      return response.data;
    },

    onSuccess: () => {
      invalidate(userQueryKey.getUserDetails());
      invalidate(agreementQueryKey.getUserPendingAgreements());
    },
  });
};

export const useSignAgreementBulk = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (data: { agreement_ids: string[] }) => {
      const response = await axiosPut(`${BASE_PATH}/sign-agreement/bulk`, { data });
      return response.data;
    },

    onSuccess: () => {
      invalidate(userQueryKey.getUserDetails());
      invalidate(agreementQueryKey.getUserPendingAgreements());
    },
  });
};

export const getPatientList = async (page?: number, searchTerm?: string) => {
  try {
    const params: GetPatientListRequest = {
      page: page || 1,
      limit: 10,
      ...(searchTerm && { search: searchTerm }),
    };

    const response = await axiosGet(`${CLIENT_BASE_PATH}/get-patient`, { params });
    const data = response.data;
    const patients = data?.data?.data || [];
    const hasMore = data.data.hasMore;
    const patientOptions = patients?.map((patient: Patient) => ({
      value: patient.id,
      data: patient,
      label: `${patient?.user?.first_name} ${patient?.user?.last_name}`,
      image: patient?.user?.profile_image || undefined,
    }));
    return {
      data: patientOptions,
      hasMore,
    };
  } catch (error) {
    if (error) {
      return {
        data: [],
        hasMore: false,
      };
    }
  }
};

// Async function for users with roles with pagination support for CustomAsyncSelect
export const getUsersWithRolesAsync = async (page?: number, searchTerm?: string) => {
  try {
    const params: Record<string, string | number> = {
      page: page || 1,
      limit: 10,
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }

    const response = await axiosGet(`${BASE_PATH}/with-roles`, {
      params,
    });

    const users = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = users.map(
      (user: {
        id: string;
        first_name?: string;
        last_name?: string;
        profile_image?: string;
        email?: string;
      }) => {
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
        return {
          value: user.id,
          label: fullName,
          image: user.profile_image,
          first_name: firstName,
          last_name: lastName,
        };
      }
    );

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error('Failed to get users with roles:', error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useCheckEmailExists = (email: string) => {
  return useQuery({
    queryKey: userQueryKey.useCheckEmailExists(email),
    queryFn: async () => {
      const response = await axiosGet('/client/check-email-exists', {
        params: { search: email },
      });
      return response.data;
    },
    enabled: !!email,
  });
};

export const useCreateNewPatient = (payload: { extraParams?: UseQueryRestParamsType }) => {
  const { extraParams } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreatePatientRequest): Promise<ApiResponse<CreatePatientResponse>> => {
      const response = await axiosPost(`client/create-patient`, {
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate([CLIENT_KEYS_NAME.LIST]);
      invalidate([USER_KEYS_NAME.LIST]);
    },
    ...extraParams,
  });
};

export const getUserDetails = ({ isEnabled = false }: { isEnabled: boolean }) => {
  return useQuery<ApiResponse<PatientData>, AxiosError>({
    queryKey: userQueryKey.getUserDetails(),
    queryFn: async () => {
      const response = await axiosGet(`/user`);
      return response.data;
    },
    select: response => response,
    enabled: isEnabled,
  });
};

export const useGetUserProfile = () => {
  return useQuery({
    queryKey: userQueryKey.useGetUserProfile(),
    queryFn: async () => {
      const response = await axiosGet(`${CLIENT_BASE_PATH}/get-user-profile`);
      return response.data;
    },
  });
};

export const useUpdateClientProfile = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async ({ data }: { data: FormData }) => {
      const response = await axiosPut(`${CLIENT_BASE_PATH}/update-user-profile`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(userQueryKey.useGetUserProfile());
    },
  });
};

export const useGetCountries = () => {
  return useQuery({
    queryKey: userQueryKey.getCountries(),
    queryFn: async () => {
      const response = await axiosGet(`/country/all-countries`);
      return response.data;
    },
  });
};

export const useGetStateByCountry = (data: { country_id?: string }) => {
  const { country_id } = data;
  return useQuery({
    queryKey: [userQueryKey.getStateByCountry(), country_id],
    queryFn: async () => {
      const response = await axiosGet(`/states/country?country_id=${country_id}`);
      return response.data;
    },
    enabled: !!country_id,
  });
};

export const useGetTherapistClientsList = (params: TherapistClientListParamsType) => {
  const { page, limit, search, filters, sortColumn, sortOrder, timezone } = params;
  return useQuery({
    queryKey: userQueryKey.getTherapistClientList(params),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search,
        sortColumn,
        sortOrder,
        timezone,
        ...(filters && {
          ...(filters.joined_date?.startDate ? { startDate: filters.joined_date.startDate } : {}),
          ...(filters.joined_date?.endDate ? { endDate: filters.joined_date?.endDate } : {}),
          ...(filters.alertTags?.length
            ? { alertTags: filters.alertTags.map(tag => tag.value) }
            : {}),
          ...(isDefined(filters.session_completed_count?.min)
            ? { min_apt_completed_count: filters.session_completed_count.min }
            : {}),
          ...(isDefined(filters.session_completed_count?.max)
            ? { max_apt_completed_count: filters.session_completed_count.max }
            : {}),
          ...(isDefined(filters.is_long_term_patient)
            ? { is_long_term_patient: filters.is_long_term_patient.value }
            : {}),
        }),
      };
      const response = await axiosGet(`${THERAPIST_BASE_PATH}/my-clients`, {
        params: queryParams,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnMount: true,
  });
};

export const useUpdateUserStatus = (data: { current_role: 'therapist' | 'staff' | 'client' }) => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async ({
      user_id,
      is_active,
      role_name,
      role_slug,
    }: {
      user_id: string;
      is_active: boolean;
      role_slug: UserRole;
      role_name?: string;
    }) => {
      const response = await axiosPut(`${BASE_PATH}/status/${user_id}`, {
        data: { is_active, role_name, role_slug },
      });
      return response.data;
    },
    onSuccess: () => {
      if (data?.current_role === 'therapist') {
        invalidate([THERAPIST_KEYS_NAME.LIST]);
      } else if (data?.current_role === 'staff') {
        invalidate([STAFF_KEYS_NAME.LIST]);
      } else if (data?.current_role === 'client') {
        invalidate([CLIENT_KEYS_NAME.LIST]);
      }
    },
  });
};

export const useUpdateUserAgreementPublic = ({ onSuccess }: { onSuccess?: () => void }) => {
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const response = await axiosPut(`${BASE_PATH}/public/sign-agreement/${id}`, {
        data: {
          token,
        },
      });
      return response.data;
    },

    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });
};
