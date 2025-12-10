import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import type { GetAllTherapistEducationType } from '@/features/profile/types';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { therapistQueryKey } from './common/therapist.queryKey';

import {
  useMutation,
  useQuery,
  type CustomUseMutationOptions,
  type CustomUseQueryOptions,
  type UseQueryRestParamsType,
} from '.';

import type { ApiResponse } from './types/common.dto';
import type { CreateTherapistEducation, EducationDataType } from './types/therapist.dto';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

const BASE_PATH = `/education`;

export const useGetTherapistEducation = (data: {
  education_id: string;
  options?: CustomUseQueryOptions<ApiResponse<EducationDataType>, AxiosError>;
  extraParams?: UseQueryRestParamsType;
  therapist_id?: string;
}) => {
  const { therapist_id, education_id, options = {}, extraParams } = data;
  return useQuery({
    queryKey: therapistQueryKey.getTherapistEducation({ education_id, therapist_id }),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${education_id}`);
      return response.data;
    },
    ...options,
    ...extraParams,
  });
};

export const useGetAllTherapistEducation = (data: {
  therapist_id?: string;
  options?: UseQueryOptions<
    ApiResponse<{ data: GetAllTherapistEducationType[]; inRequestMode: boolean }>,
    AxiosError
  >;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { therapist_id, options, extraParams } = data;
  return useQuery({
    queryKey: therapistQueryKey.getTherapistAllEducation(therapist_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}`, {
        params: { therapist_id },
      });
      return response.data;
    },
    ...options,
    ...extraParams,
  });
};

export const useCreateTherapistEducation = (payload: {
  therapist_id?: string;
  options?: CustomUseMutationOptions;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateTherapistEducation) => {
      const response = await axiosPost(`${BASE_PATH}`, {
        data,
        params: { therapist_id },
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate(therapistQueryKey.getTherapistAllEducation(therapist_id));
    },
  });
};

export const useUpdateTherapistEducation = (payload: {
  education_id?: string;
  therapist_id?: string;
  options?: CustomUseMutationOptions;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, education_id, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateTherapistEducation) => {
      const response = await axiosPut(`${BASE_PATH}/${education_id}`, {
        data,
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate(therapistQueryKey.getTherapistAllEducation(therapist_id));
    },
  });
};

export const useDeleteTherapistEducation = (payload: {
  therapist_id?: string;
  options?: CustomUseMutationOptions<ApiResponse<Response>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (education_id: string) => {
      const response = await axiosDelete(`${BASE_PATH}/${education_id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate(therapistQueryKey.getTherapistAllEducation(therapist_id));
    },
    ...options,
    ...extraParams,
  });
};
