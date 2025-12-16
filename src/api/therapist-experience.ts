import {
  useMutation,
  useQuery,
  type CustomUseMutationOptions,
  type CustomUseQueryOptions,
  type UseQueryRestParamsType,
} from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { therapistQueryKey } from '@/api/common/therapist.queryKey';
import type {
  AllTherapistExperienceResponse,
  CreateTherapistExperienceRequest,
  TherapistExperienceResponse,
  UpdateTherapistExperienceRequest,
} from '@/api/types/therapist.dto';
import type { ApiResponse } from '@/features/appointment/types';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

const THERAPIST_EXPERIENCE_PATH = `/experience`;

export const useGetTherapistExperience = (data: {
  therapist_id?: string;
  experience_id: string;
  options?: CustomUseQueryOptions<ApiResponse<TherapistExperienceResponse>, AxiosError>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { therapist_id, experience_id, options = {}, extraParams } = data;
  return useQuery({
    queryKey: therapistQueryKey.getTherapistExperience({ experience_id, therapist_id }),
    queryFn: async () => {
      const response = await axiosGet(`${THERAPIST_EXPERIENCE_PATH}/${experience_id}`);
      return response.data;
    },
    ...options,
    ...extraParams,
  });
};

export const useGetAllTherapistExperience = (data: {
  therapist_id?: string;
  options?: UseQueryOptions<
    ApiResponse<{ data: AllTherapistExperienceResponse[]; inRequestMode: boolean }>,
    AxiosError
  >;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { therapist_id, options, extraParams } = data;
  return useQuery({
    queryKey: therapistQueryKey.getTherapistAllExperience(therapist_id),
    queryFn: async () => {
      const response = await axiosGet(`${THERAPIST_EXPERIENCE_PATH}/getAll`, {
        params: { therapist_id },
      });
      return response.data;
    },
    ...options,
    ...extraParams,
  });
};

export const useCreateTherapistExperience = (payload: {
  therapist_id?: string;
  options?: CustomUseMutationOptions<ApiResponse<CreateTherapistExperienceRequest>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateTherapistExperienceRequest) => {
      const response = await axiosPost(`${THERAPIST_EXPERIENCE_PATH}`, {
        data,
        params: { therapist_id },
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate(therapistQueryKey.getTherapistAllExperience(therapist_id));
      invalidate(therapistQueryKey.getBasicDetailsKey());
    },
  });
};

export const useUpdateTherapistExperience = (payload: {
  experience_id?: string;
  therapist_id?: string;
  options?: CustomUseMutationOptions<ApiResponse<UpdateTherapistExperienceRequest>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, experience_id, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (data: CreateTherapistExperienceRequest) => {
      const response = await axiosPut(`${THERAPIST_EXPERIENCE_PATH}/${experience_id}`, {
        data,
      });
      return response.data;
    },
    ...options,
    ...extraParams,
    onSuccess: () => {
      invalidate(therapistQueryKey.getTherapistAllExperience(therapist_id));
      invalidate(therapistQueryKey.getBasicDetailsKey());
    },
  });
};

export const useDeleteTherapistExperience = (payload: {
  therapist_id?: string;
  options?: CustomUseMutationOptions<ApiResponse<Response>>;
  extraParams?: UseQueryRestParamsType;
}) => {
  const { options = {}, extraParams, therapist_id } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (experience_id: string) => {
      const response = await axiosDelete(`${THERAPIST_EXPERIENCE_PATH}/${experience_id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate(therapistQueryKey.getTherapistAllExperience(therapist_id));
      invalidate(therapistQueryKey.getBasicDetailsKey());
    },
    ...options,
    ...extraParams,
  });
};
