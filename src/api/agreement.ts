import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios.ts';
import { agreementQueryKey } from '@/api/common/agreement.queryKey';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import type { Agreement } from '@/features/management/components/agreement/hooks';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { useMutation, useQuery } from '.';

const BASE_PATH = '/agreement';
const USER_BASE_PATH = '/user';

export const useAgreementList = (params: object) => {
  return useQuery({
    queryKey: agreementQueryKey.getAgreementList({ params }),
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

export const useGetAgreementById = (agreement_id: string) => {
  return useQuery({
    queryKey: agreementQueryKey.getAgreementById(agreement_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${agreement_id}`);
      return response.data;
    },
    enabled: !!agreement_id,
  });
};

export const useCreateAgreement = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.createAgreement(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidate(agreementQueryKey.getAgreementList());
    },
  });
};

export const useUpdateAgreementById = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.updateAgreement(),
    mutationFn: async ({ data, id }: { data: Partial<Agreement>; id: string }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      invalidate(agreementQueryKey.getAgreementById(id));
      return response.data;
    },
    onSuccess: async () => {
      invalidate(agreementQueryKey.getAgreementList());
    },
  });
};

export const useDeleteAgreementById = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.deleteAgreement(),
    mutationFn: (id: string) => axiosDelete(`${BASE_PATH}/${id}`),
    onSuccess: () => {
      invalidate(agreementQueryKey.getAgreementList());
    },
  });
};

export const useToggleAgreement = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.toggleAgreement(),
    mutationFn: (id: string) => axiosPut(`${BASE_PATH}/toggle/${id}`),
    onSuccess: () => {
      invalidate(agreementQueryKey.getAgreementList());
    },
  });
};

export const useGetUserPendingAgreements = (enabled = true) => {
  return useQuery({
    queryKey: agreementQueryKey.getUserPendingAgreements(),
    queryFn: async () => {
      const response = await axiosGet(`${USER_BASE_PATH}/pending-agreements`);
      return response.data;
    },
    enabled,
  });
};

export const useGetAgreementByIdPublic = (agreement_id: string, token: string) => {
  return useQuery({
    queryKey: agreementQueryKey.getAgreementById(agreement_id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/public/${agreement_id}`, {
        params: {
          token,
        },
      });
      return response.data;
    },
    enabled: !!agreement_id,
  });
};
