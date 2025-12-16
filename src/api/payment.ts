import { useMutation, useQuery } from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { calendarQueryKeys } from '@/api/common/calendar.queryKey';
import { paymentQueryKey } from '@/api/common/payment.queryKey';
import { transactionQueryKey } from '@/api/common/transaction.query.key';
import type {
  CustomerPaymentProfileData,
  CustomerPaymentProfileResponse,
} from '@/api/types/payment.dto';
import { useInvalidateQuery } from '@/hooks/data-fetching';

// import type { CustomerPaymentProfileData, CustomerPaymentProfileResponse } from './types';

const BASE_PATH = '/payment';
const USER_PATH = '/user';

export const useGetCustomerPaymentProfile = (params?: { clientId?: string }) => {
  return useQuery<CustomerPaymentProfileResponse, Error, CustomerPaymentProfileData>({
    queryKey: paymentQueryKey.customerProfile(),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/customer-payment-profile`, {
        params: {
          ...(params?.clientId ? { client_id: params?.clientId } : {}),
        },
      });
      return response.data as CustomerPaymentProfileResponse;
    },
    enabled: !!params?.clientId,
  });
};

export interface PaymentProfileStatusResponse {
  has_payment_method: boolean;
}

export const useGetUserPaymentProfileStatus = (enabled = true) => {
  return useQuery({
    queryKey: paymentQueryKey.userPaymentProfile(),
    queryFn: async (): Promise<PaymentProfileStatusResponse> => {
      const response = await axiosGet(`${USER_PATH}/payment-method-status`);
      return response.data as PaymentProfileStatusResponse;
    },
    enabled,
  });
};

export interface AddPaymentMethodPayload {
  payment: {
    creditCard: {
      cardNumber: string;
      expirationDate: string;
    };
  };
  billTo: {
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  client_id: string;
  defaultPaymentProfile: boolean;
}

export interface UpdatePaymentMethodPayload {
  payment?: {
    creditCard: {
      cardNumber: string;
      expirationDate: string;
    };
  };
  billTo?: {
    address: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  client_id: string;
  defaultPaymentProfile: boolean;
}

// export interface UpdatePaymentMethodPayload {
//   payment?: {
//     creditCard?: {
//       cardNumber?: string;
//       expirationDate?: string;
//     };
//   };
//   client_id: string;
//   defaultPaymentProfile?: boolean;
// }

export const useAddPaymentMethod = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (payload: AddPaymentMethodPayload) => {
      const response = await axiosPost(`${BASE_PATH}/add-payment-method`, {
        data: payload,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate(paymentQueryKey.customerProfile());
      invalidate(paymentQueryKey.userPaymentProfile());
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      data: UpdatePaymentMethodPayload;
      id: string | undefined | null;
    }) => {
      const response = await axiosPut(`${BASE_PATH}/payment-profile/${id}`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(paymentQueryKey.customerProfile());
    },
  });
};

export interface DeletePaymentMethodPayload {
  customerPaymentProfileId: string;
  client_id: string;
}

export const useDeletePaymentMethod = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (payload: DeletePaymentMethodPayload) => {
      const response = await axiosDelete(
        `${BASE_PATH}/payment-profile/${payload.customerPaymentProfileId}`,
        { data: { client_id: payload?.client_id } }
      );
      return response.data;
    },
    onSuccess: () => {
      invalidate(paymentQueryKey.customerProfile());
    },
  });
};

export interface ChargeAppointmentPayload {
  amount: string | number;
  appointmentId: string;
  isPartialPayment?: boolean;
  paymentProfileId?: string;
}

export const useChargeAppointment = (params?: { close?: () => void }) => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async (payload: ChargeAppointmentPayload) => {
      const response = await axiosPost(`${BASE_PATH}/charge-appointment`, {
        data: payload,
      });
      return response.data;
    },
    onSuccess: data => {
      if (params?.close) {
        params?.close();
      }
      invalidate(calendarQueryKeys.appointmentsDetail(data.appointmentId));
      invalidate(transactionQueryKey.getTransactionList({}));
    },
  });
};
