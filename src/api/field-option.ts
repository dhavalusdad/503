import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import type { ApiResponse } from '@/api/types/common.dto';
import type { GetFieldOptionByTypeResponseType } from '@/api/types/field-option.dto';
import { FieldOptionType } from '@/enums';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { useMutation, type CustomUseQueryOptions, type UseQueryRestParamsType, useQuery } from '.';

import type { AxiosError } from 'axios';
const BASE_PATH = '/field-options';

// Generic async function for infinite scrolling field options
export const getFieldOptionsAsync = async (
  type: string,
  page?: number,
  searchTerm?: string,
  mapFn?: (item: { id: string; name: string }) => { label: string; value: string }
) => {
  try {
    const response = await axiosGet(`${BASE_PATH}/type`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        type: type,
        page: page || 1,
        limit: 10,
      },
    });

    const fieldOptions = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = fieldOptions.map(
      mapFn ||
        ((item: { id: string; name: string }) => ({
          value: item.id,
          label: item.name,
        }))
    );

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (e) {
    console.error(`Failed to get ${type}:`, e);
    return {
      data: [],
      hasMore: false,
    };
  }
};

// Specific functions using the generic one
export const getAreaOfFocusAsync = (page?: number, searchTerm?: string) =>
  getFieldOptionsAsync(FieldOptionType.AREA_OF_FOCUS, page, searchTerm);

export const getCarrierName = (page?: number, searchTerm?: string) =>
  getFieldOptionsAsync('CarrierName', page, searchTerm);

export const getPaymentMethodsAsync = (page?: number, searchTerm?: string) =>
  getFieldOptionsAsync('PaymentMethod', page, searchTerm);

export const getTherapyTypesAsync = (page?: number, searchTerm?: string) =>
  getFieldOptionsAsync(FieldOptionType.THERAPY_TYPE, page, searchTerm);

export const useGetFieldOptionsByType = (data: {
  fieldOptionType: string;
  options?: CustomUseQueryOptions<ApiResponse<GetFieldOptionByTypeResponseType>, AxiosError>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { fieldOptionType, options, extraParams } = data;
  return useQuery({
    enabled: !!fieldOptionType,
    queryKey: fieldOptionsQueryKey.getFieldOptionsKey(fieldOptionType),

    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/type`, {
        params: { type: fieldOptionType },
      });
      return response?.data?.data || [];
    },
    ...options,
    ...extraParams,
  });
};

export const useGetFieldOptionsList = (params: object) => {
  return useQuery({
    queryKey: fieldOptionsQueryKey.getFieldOptionsList({ params }),
    queryFn: () =>
      axiosGet(`${BASE_PATH}`, {
        params: {
          ...params,
        },
      }),
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
  });
};

export const useCreateFieldOptions = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.createFieldOptions(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidate(fieldOptionsQueryKey.getFieldOptionsList());
      invalidate(['carrierName']);
    },
  });
};

export const useGetFieldOptionsById = (id: string | undefined) => {
  return useQuery({
    queryKey: fieldOptionsQueryKey.getFieldOptionsById(id),
    queryFn: () => axiosGet(`${BASE_PATH}/${id}`),
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

export const useUpdateFieldOptions = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.updateFieldOptions(),
    mutationFn: async ({ id, data }: { id: string; data: object }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      invalidate(fieldOptionsQueryKey.getFieldOptionsById(id));
      invalidate(fieldOptionsQueryKey.getFieldOptionsList());
    },
  });
};

export const useDeleteFieldOptions = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.deleteFieldOptions(),
    mutationFn: (id: string) => axiosDelete(`${BASE_PATH}/${id}`),
    onSuccess: () => {
      invalidate(fieldOptionsQueryKey.getFieldOptionsList());
    },
  });
};

export const getFieldOptionsAsyncByTherapistId = async (
  type: string,
  page?: number,
  searchTerm?: string,
  therapist_id?: string
) => {
  try {
    const response = await axiosGet(`${BASE_PATH}/type`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        type: type,
        page: page || 1,
        limit: 10,
        ...(therapist_id ? { therapist_id: therapist_id } : {}),
      },
    });
    const fieldOptions = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = fieldOptions.map((item: { id: string; name: string }) => ({
      value: item.id,
      label: item.name,
    }));

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (e) {
    console.error(`Failed to get ${type}:`, e);
    return {
      data: [],
      hasMore: false,
    };
  }
};
