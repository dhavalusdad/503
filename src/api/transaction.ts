import { axiosGet, axiosPost } from '@/api/axios.ts';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { calendarQueryKeys } from './common/calendar.queryKey';
import { mutationsQueryKey } from './common/mutations.queryKey';
import { transactionQueryKey } from './common/transaction.query.key';

import { useMutation, useQuery } from '.';

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
