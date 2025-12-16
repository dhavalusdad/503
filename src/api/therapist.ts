import {
  type CustomUseMutationOptions,
  type CustomUseQueryOptions,
  type UseQueryRestParamsType,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { therapistQueryKeys } from '@/api/common/appointment.queryKey';
import { THERAPIST_KEYS_NAME, therapistQueryKey } from '@/api/common/therapist.queryKey.ts';
import type {
  CreateOrUpdateExperienceResponse,
  GetTherapistBasicDetailsResponse,
  InfiniteTherapistPageResponse,
  TherapistBasicDetails,
  TherapistEngagementReturnType,
  TherapistListParamsType,
  TherapistOptionsResponseDataType,
  TherapistSearchItem,
  TherapistSearchResponse,
  UpdateTherapistAmdProviderRequest,
  UpdateTherapistBasicDetailsRequest,
} from '@/api/types/therapist.dto';
import { isDefined } from '@/api/utils';
import type { ApiResponse } from '@/features/appointment/types';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import type { UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export type GetAllTherapistParamsType = {
  page: number;
  limit: number;
  search: string;
  sortColumn: string;
  sortOrder: string;
};
const BASE_PATH = '/therapist';

export const getTherapistListForAdmin = async (
  page?: number,
  searchTerm?: string,
  extraParams?: Record<string, string>
) => {
  try {
    const response = await axiosGet(`${BASE_PATH}/get-therapist-list-for-admin`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
        ...(extraParams || {}),
      },
    });

    const fieldOptions = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = fieldOptions.map(
      (client: {
        id: string;
        user: { first_name: string; last_name: string; profile_image: string };
      }) => ({
        value: client.id,
        label: `${client.user?.first_name || ''} ${client.user?.last_name || ''}`.trim(),
        image: client.user?.profile_image,
        first_name: client.user?.first_name,
        last_name: client.user?.last_name,
      })
    );

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error(`Failed to get therapist list for admin:`, error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

// Async function for therapists with pagination support for CustomAsyncSelect
export const getTherapistsAsync = async (page?: number, searchTerm?: string) => {
  try {
    const params: Record<string, string | number> = {
      page: page || 1,
      limit: 10,
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }

    const response = await axiosGet(`${BASE_PATH}/filter-list`, {
      params,
    });

    const therapists = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = therapists.map(
      (therapist: {
        id: string;
        user?: { first_name: string; last_name: string; profile_image?: string };
        full_name?: string;
      }) => {
        // Handle both response structures (with user object or direct properties)
        const firstName = therapist.user?.first_name || '';
        const lastName = therapist.user?.last_name || '';
        const fullName =
          therapist.full_name || `${firstName} ${lastName}`.trim() || 'Unknown Therapist';
        return {
          value: therapist.id,
          label: fullName,
          image: therapist.user?.profile_image,
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
    console.error('Failed to get therapists:', error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useGetTherapistBasicDetails = (data: {
  therapist_id?: string;
  options?: CustomUseQueryOptions<ApiResponse<GetTherapistBasicDetailsResponse>, AxiosError>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = data;
  return useQuery({
    queryKey: therapistQueryKey.getBasicDetailsKey(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/basic-details`, {
        ...(therapist_id && {
          params: {
            therapist_id,
          },
        }),
      });
      return response.data;
    },

    ...options,
    ...extraParams,
  });
};

export const useGetTherapistBasicDetailsInfo = (data: {
  therapist_id?: string;
  options?: CustomUseQueryOptions<ApiResponse<GetTherapistBasicDetailsResponse>, AxiosError>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = data;
  return useQuery({
    queryKey: therapistQueryKey.getBasicDetailsInfoKey(therapist_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/basic-details/info/${therapist_id}`);
      return response;
    },
    enabled: !!therapist_id,
    showToast: false,
    ...options,
    ...extraParams,
  });
};

export const useGetTherapistBasicDetailsInfoForDashboard = (data: {
  therapist_id?: string;
  options?: CustomUseQueryOptions<ApiResponse<GetTherapistBasicDetailsResponse>, AxiosError>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = data;
  return useQuery({
    queryKey: therapistQueryKey.getBasicDetailsInfoKey(therapist_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/basic-details/dashboard/${therapist_id}`);
      return response;
    },
    enabled: !!therapist_id,
    showToast: false,
    ...options,
    ...extraParams,
  });
};

export const useUpdateTherapistBasicDetails = (payload: {
  therapist_id?: string;
  options?: CustomUseMutationOptions<ApiResponse<UpdateTherapistBasicDetailsRequest>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateOrUpdateExperienceResponse) => {
      const response = await axiosPut(`${BASE_PATH}/basic-details`, {
        data,
        ...(therapist_id && {
          params: {
            therapist_id,
          },
        }),
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate([THERAPIST_KEYS_NAME.LIST], 'active', false);
      invalidate(therapistQueryKey.getBasicDetailsKey());
    },
  });
};

export const useTherapistProfileChangeRequest = (payload: {
  therapist_id?: string;
  options?: CustomUseMutationOptions<ApiResponse<UpdateTherapistBasicDetailsRequest>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateOrUpdateExperienceResponse) => {
      const response = await axiosPut(`/profile-change-request`, {
        data,
        ...(therapist_id && {
          params: {
            therapist_id,
          },
        }),
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate(therapistQueryKey.getBasicDetailsKey());
    },
  });
};

export const useGetTherapistList = (params: TherapistListParamsType) => {
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
    queryKey: therapistQueryKey.getTherapistList({ ...params, ...modifiedData }),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search ?? undefined,
        sortColumn: modifiedData.sortColumn,
        sortOrder: modifiedData.sortOrder,
        timezone,
        ...(filters && {
          ...(filters.status ? { status: filters.status.value } : {}),
          ...(filters.joined_date?.startDate ? { startDate: filters.joined_date?.startDate } : {}),
          ...(filters.joined_date?.endDate ? { endDate: filters.joined_date?.endDate } : {}),
          ...(filters.gender ? { gender: filters.gender.value } : {}),
          ...(isDefined(filters.client_count?.min)
            ? { min_client_count: filters.client_count.min }
            : {}),
          ...(isDefined(filters.client_count?.max)
            ? { max_client_count: filters.client_count.max }
            : {}),
          ...(filters.specialties?.length
            ? { specialties: JSON.stringify(filters.specialties.map(item => item.value)) }
            : {}),
        }),
      };
      const response = await axiosGet(`${BASE_PATH}/list`, {
        params: queryParams,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useCreateTherapist = (payload: {
  options?: CustomUseMutationOptions<ApiResponse<FormData>>;
  extraParams?: UseQueryRestParamsType;
}): UseMutationResult<
  ApiResponse<{ therapist_id: string }>,
  unknown,
  TherapistBasicDetails,
  unknown
> => {
  const { invalidate } = useInvalidateQuery();
  const { options = {}, extraParams } = payload;
  return useMutation({
    mutationFn: async (data: TherapistBasicDetails) => {
      const response = await axiosPost(`${BASE_PATH}/basic-details`, {
        data,
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate([THERAPIST_KEYS_NAME.LIST], 'active', false);
    },
  });
};

export const useDeleteTherapist = (payload: {
  options?: CustomUseMutationOptions<string>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (therapist_id: string) => {
      const response = await axiosDelete(`${BASE_PATH}/${therapist_id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate([THERAPIST_KEYS_NAME.LIST], 'active', false);
    },
    ...options,
    ...extraParams,
  });
};

export const useGetAllTherapists = (filters?: TherapistSearchItem) => {
  return useQuery({
    queryKey: therapistQueryKeys?.search(filters?.search),
    queryFn: async (): Promise<TherapistSearchResponse> => {
      const response = await axiosGet(`/therapist`, {
        params: filters,
      });

      return response.data.data;
    },
  });
};

export const useInfiniteTherapistQuery = (filters: TherapistSearchItem) => {
  return useInfiniteQuery<InfiniteTherapistPageResponse>({
    queryKey: therapistQueryKeys?.search(filters?.search),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosGet(`/therapist`, {
        params: {
          ...filters,
          page: pageParam,
          limit: 20,
        },
      });
      return {
        data: res.data.data.data,
        total: res.data.data.total,
        hasMore: res.data.data.data.length > 0 && pageParam * 20 < res.data.data.total,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    refetchOnMount: false,
    enabled: Object.values(filters).join('') !== '',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const getTherapistOptions = async (page?: number, searchTerm?: string) => {
  try {
    const params = {
      ...(searchTerm ? { search: searchTerm } : {}),
      page: page || 1,
      limit: 50,
    };
    const response = await axiosGet(`${BASE_PATH}/options`, { params });
    const { data } = response.data;
    const therapists = data?.data || [];
    const hasMore = data.hasMore;
    const options = therapists?.map((therapist: TherapistOptionsResponseDataType) => {
      const { id, name, profile_image } = therapist;
      return {
        label: name,
        value: id,
        image: profile_image,
      };
    });
    return {
      data: options,
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

export const useGetSessionProgressData = (params: {
  limit: number;
  page: number;
  timezone: string;
}) => {
  const { limit, page, timezone } = params;
  return useQuery({
    queryKey: therapistQueryKey.getClientSessionProgress(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/session-progress`, {
        params: {
          page,
          limit,
          timezone,
        },
      });
      return response.data;
    },
  });
};

export const useGetTherapistSessionEngagementData = () => {
  return useQuery({
    queryKey: therapistQueryKey.getTherapistSessionEngagement(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/session-engagement`);
      return response.data as TherapistEngagementReturnType;
    },
  });
};

export const useUpdateTherapistAmdProviderId = (payload: { therapist_id: string }) => {
  const { therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationKey: ['update-therapist-amd-provider-id'],
    mutationFn: async (data: UpdateTherapistAmdProviderRequest) => {
      const response = await axiosPut(`${BASE_PATH}/${therapist_id}/amd-provider-id`, {
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate(therapistQueryKey.getTherapistList({ page: 1, limit: 10, filters: {} }));
    },
  });
};
