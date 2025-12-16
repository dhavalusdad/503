import { useMutation, useQuery } from '@/api';
import { axiosGet, axiosPost } from '@/api/axios';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { transactionQueryKey } from '@/api/common/transaction.query.key';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import type { AxiosError } from 'axios';

const BASE_PATH = '/transaction';
export interface BackendError {
  success?: boolean;
  message?: string;
  errorCode?: string;
  data?: {
    isExpired?: boolean;
  };
}

export const useTransactionList = (params?: object) => {
  return useQuery({
    queryKey: transactionQueryKey.getTransactionList({ params }),
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

export const useGetTransactionById = (id: string | undefined) => {
  return useQuery({
    queryKey: transactionQueryKey.getTransactionById(id),
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

export const useSendApprovalTransaction = (appointment_id?: string) => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.sendTransactionApproval(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}/approval`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(transactionQueryKey.getTransactionList());
      invalidate(calendarQueryKeys.appointmentsDetail(appointment_id));
    },
    onError: (error: AxiosError<BackendError>) => {
      const data = error.response?.data?.data;

      if (data?.isExpired) {
        invalidate(transactionQueryKey.getTransactionList());
        invalidate(calendarQueryKeys.appointmentsDetail(appointment_id));
      }
    },
  });
};

export const useRevertTransaction = (appointment_id?: string) => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.revertTransaction(),
    mutationFn: async ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: { amount: number; reason: string; note: string };
    }) => {
      const response = await axiosPost(`${BASE_PATH}/${transactionId}/revert`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(transactionQueryKey.getTransactionList());
      if (appointment_id) {
        invalidate(calendarQueryKeys.appointmentsDetail(appointment_id));
      }
    },
  });
};
