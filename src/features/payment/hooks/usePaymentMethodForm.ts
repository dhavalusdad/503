import { yupResolver } from '@hookform/resolvers/yup/src/yup.js';
import { useForm } from 'react-hook-form';

import {
  type AddPaymentMethodPayload,
  useAddPaymentMethod,
  useUpdatePaymentMethod,
} from '@/api/payment';
import type { PaymentProfileDetails } from '@/api/types/payment.dto';

import { type PaymentFormData, paymentMethodSchema } from '../schemas/paymentValidation';

interface UsePaymentMethodFormProps {
  onSuccess?: () => void;
  client_id?: string;
  paymentProfileDetails?: PaymentProfileDetails | null;
  isEditMode?: boolean;
}

export const usePaymentMethodForm = ({
  onSuccess,
  client_id,
  paymentProfileDetails,
  isEditMode = false,
}: UsePaymentMethodFormProps = {}) => {
  const addPaymentMethod = useAddPaymentMethod();
  const { mutate: updatePaymentProfile, isPending: isPendingUpdatePaymentProfile } =
    useUpdatePaymentMethod();

  const form = useForm<PaymentFormData>({
    resolver: yupResolver(paymentMethodSchema),

    defaultValues: {
      cardNumber: '',
      expirationMonth: null,
      expirationYear: null,

      defaultPaymentProfile: paymentProfileDetails?.defaultPaymentProfile ?? false,

      // Address info
      address: paymentProfileDetails?.billTo?.address ?? '',
      city: paymentProfileDetails?.billTo?.city ?? '',
      state: paymentProfileDetails?.billTo?.state ?? '',
      country: paymentProfileDetails?.billTo?.country ?? '',
      zip: paymentProfileDetails?.billTo?.zip ?? '',
    },
  });

  const onSubmit = (formData: PaymentFormData) => {
    // Extract values from SelectOption objects
    const month = formData.expirationMonth?.value || '';
    const year = formData.expirationYear?.value || '';

    const expirationDate = `${year}-${month}`;

    const payload: AddPaymentMethodPayload = {
      payment: {
        creditCard: {
          cardNumber: formData?.cardNumber,
          expirationDate: expirationDate,
        },
      },
      billTo: {
        address: formData?.address,
        city: formData?.city,
        state: formData?.state,
        country: formData?.country,
        zip: formData?.zip,
      },
      client_id: client_id || '',
      defaultPaymentProfile:
        paymentProfileDetails?.defaultPaymentProfile || formData.defaultPaymentProfile
          ? true
          : false,
    };

    if (isEditMode) {
      updatePaymentProfile(
        {
          data: payload,
          id: paymentProfileDetails?.customerPaymentProfileId,
        },
        {
          onSuccess: () => {
            form.reset();
            onSuccess?.();
          },
        }
      );
    } else {
      addPaymentMethod.mutate(payload, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      });
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: addPaymentMethod.isPending,
    isPendingUpdatePaymentProfile: isPendingUpdatePaymentProfile,
  };
};
