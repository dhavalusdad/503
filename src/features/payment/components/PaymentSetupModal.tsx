import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, type FieldValues, type UseFormRegister } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { type AddPaymentMethodPayload, useAddPaymentMethod } from '@/api/payment';
import {
  paymentMethodSchema,
  type PaymentFormData,
} from '@/features/payment/schemas/paymentValidation';
import { getMonthOptions, getYearOptions } from '@/features/payment/utils/paymentHelpers';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import Select, { type SelectOption } from '@/stories/Common/Select';

// // Validation schema for payment form
// const paymentValidationSchema = yup.object().shape({
//   cardNumber: yup
//     .string()
//     .required('Card number is required')
//     .matches(/^[0-9]{13,19}$/, 'Please enter a valid card number (13-19 digits)'),
//   expirationMonth: yup
//     .mixed<SelectOption>()
//     .nullable()
//     .required('Expiration month is required')
//     .test('is-select-option', 'Expiration month is required', value => {
//       return (
//         value !== null &&
//         value !== undefined &&
//         typeof value === 'object' &&
//         'value' in value &&
//         'label' in value
//       );
//     }),
//   expirationYear: yup
//     .mixed<SelectOption>()
//     .nullable()
//     .required('Expiration year is required')
//     .test('is-select-option', 'Expiration year is required', value => {
//       return (
//         value !== null &&
//         value !== undefined &&
//         typeof value === 'object' &&
//         'value' in value &&
//         'label' in value
//       );
//     }),
//   defaultPaymentProfile: yup.boolean(),
// });

export const PaymentSetupModal = ({
  isOpen,
  onClose,
  clientId,
  // closeButton = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  closeButton?: boolean;
}) => {
  const { client_id } = useSelector(currentUser);
  const [showAddAnotherPrompt, setShowAddAnotherPrompt] = useState(false);
  const [hasOpenedAdditionalAttempt, setHasOpenedAdditionalAttempt] = useState(false);

  // API mutation for adding multiple payment methods
  const { mutateAsync: addPaymentMethod, isPending: isSaving } = useAddPaymentMethod();

  const {
    handleSubmit,
    setValue,
    getValues,
    reset,
    register,
    formState: { errors },
  } = useForm<PaymentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(paymentMethodSchema) as any,
    defaultValues: {
      cardNumber: '',
      expirationMonth: null,
      expirationYear: null,

      defaultPaymentProfile: false,

      // Address info
      address: '',
      city: '',
      state: '',
      country: '',
      zip: '',
    },
  });
  const registerInputField = register as unknown as UseFormRegister<FieldValues>;

  const months = getMonthOptions();
  const years = getYearOptions();

  const buildPaymentPayload = (data: PaymentFormData, clientIdToUse: string | undefined) => {
    if (!data.expirationMonth || !data.expirationYear) {
      return null;
    }
    if (!clientIdToUse) {
      return null;
    }

    const month = String(data.expirationMonth.value || '');
    const year = String(data.expirationYear.value || '');
    const expirationDate = `${year}-${month}`;

    return {
      payment: {
        creditCard: {
          cardNumber: data.cardNumber,
          expirationDate: expirationDate,
        },
      },
      billTo: {
        address: data?.address,
        city: data?.city,
        state: data?.state,
        country: data?.country,
        zip: data?.zip,
      },
      client_id: clientIdToUse,
      defaultPaymentProfile: data.defaultPaymentProfile ? 'true' : 'false',
    };
  };

  const resetForm = () => {
    reset({
      cardNumber: '',
      expirationMonth: null,
      expirationYear: null,
      defaultPaymentProfile: false,
    });
  };

  const handleSuccessfulSave = () => {
    if (hasOpenedAdditionalAttempt) {
      onClose();
      return;
    }

    setShowAddAnotherPrompt(true);
  };

  const handleSave = handleSubmit(async data => {
    try {
      const clientIdToUse = client_id || clientId;
      const payload: AddPaymentMethodPayload | null = buildPaymentPayload(data, clientIdToUse);
      if (!payload) {
        return;
      }

      await addPaymentMethod(payload);
      resetForm();
      handleSuccessfulSave();
    } catch (error) {
      console.error('Failed to save payment method:', error);
    }
  });

  const handleAddAnotherConfirmed = () => {
    setHasOpenedAdditionalAttempt(true);
    setShowAddAnotherPrompt(false);
    resetForm();
  };

  const handleDeclineAddAnother = () => {
    setShowAddAnotherPrompt(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showAddAnotherPrompt}
        onClose={onClose}
        title='Payment Setup'
        size='lg'
        id='payment-setup-modal'
        closeButton={hasOpenedAdditionalAttempt}
        contentClassName='pt-30px'
        footerClassName='pt-30px border-t border-solid border-surface flex justify-end gap-5'
        footer={
          <>
            <Button
              variant='filled'
              title='Save'
              onClick={handleSave}
              isLoading={isSaving}
              isDisabled={isSaving}
              className='rounded-10px !px-6'
            />
          </>
        }
      >
        <div className='flex flex-col gap-5'>
          <h3 className='text-xl font-bold text-blackdark leading-7'>Add Payment Method</h3>

          <InputField
            register={registerInputField}
            name='cardNumber'
            type='text'
            label='Card Number'
            labelClass='!text-base'
            isRequired={true}
            placeholder='1234 5678 9012 3456'
            error={errors.cardNumber?.message}
            inputClass='!text-base !leading-5'
          />

          <div>
            <label className='text-blackdark text-base font-normal mb-1.5 block leading-5'>
              Expiration Date <span className='text-red-500'>*</span>
            </label>
            <div className='grid grid-cols-2 gap-5'>
              <Select
                name='expirationMonth'
                placeholder='Select Month'
                options={months}
                error={errors.expirationMonth?.message}
                isClearable={false}
                portalRootId='payment-setup-modal'
                value={getValues('expirationMonth')}
                onChange={value => {
                  setValue('expirationMonth', value as SelectOption, { shouldValidate: true });
                }}
                StylesConfig={{
                  control: () => ({
                    minHeight: '50px',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '20px',
                  }),
                  option: () => ({
                    fontSize: '16px',
                  }),
                }}
              />
              <Select
                name='expirationYear'
                placeholder='Select Year'
                options={years}
                error={errors.expirationYear?.message}
                isClearable={false}
                portalRootId='payment-setup-modal'
                value={getValues('expirationYear')}
                onChange={value => {
                  setValue('expirationYear', value as SelectOption, { shouldValidate: true });
                }}
                StylesConfig={{
                  control: () => ({
                    minHeight: '50px',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '20px',
                  }),
                  option: () => ({
                    fontSize: '16px',
                  }),
                }}
              />
            </div>
          </div>

          <div className='inline-block'>
            <CheckboxField
              name='defaultPaymentProfile'
              id='defaultPaymentProfile'
              label='Set as default payment method'
              labelClass='whitespace-nowrap !text-base !leading-4'
              isChecked={getValues('defaultPaymentProfile')}
              onChange={e => {
                setValue('defaultPaymentProfile', e.target.checked as boolean, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
        </div>
        <div className='flex flex-col gap-5'>
          {/* existing fields... */}

          <InputField
            register={register}
            name='address'
            type='text'
            label='Address'
            placeholder='123 Main St'
            error={errors.address?.message}
          />

          <div className='grid grid-cols-2 gap-5'>
            <InputField
              register={register}
              name='city'
              type='text'
              label='City'
              placeholder='Los Angeles'
              error={errors.city?.message}
            />

            <InputField
              register={register}
              name='state'
              type='text'
              label='State'
              placeholder='Washington'
              error={errors.state?.message}
            />
          </div>

          <div className='grid grid-cols-2 gap-5'>
            <InputField
              register={register}
              name='country'
              type='text'
              label='Country'
              placeholder='United States'
              error={errors.country?.message}
            />

            <InputField
              register={register}
              name='zip'
              type='text'
              label='ZIP Code'
              placeholder='380001'
              error={errors.zip?.message}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showAddAnotherPrompt}
        onClose={handleDeclineAddAnother}
        title=''
        size='xs'
        id='add-another-payment-modal'
        closeButton={false}
        contentClassName='pt-30px'
        footerClassName=' flex gap-5 w-full'
        footer={
          <>
            <Button
              variant='outline'
              title='No'
              onClick={handleDeclineAddAnother}
              className='rounded-10px !px-8 min-h-50px !w-full !font-bold'
              parentClassName='w-2/4'
            />
            <Button
              variant='filled'
              title='Yes'
              onClick={handleAddAnotherConfirmed}
              isDisabled={hasOpenedAdditionalAttempt}
              className='rounded-10px !px-8 min-h-50px !w-full !font-bold'
              parentClassName='w-2/4'
            />
          </>
        }
      >
        <div className='flex flex-col items-center text-center gap-5'>
          <Icon name='tickcircle' className='inline-block text-Green' />
          <div className='flex flex-col gap-1.5'>
            <h6 className='text-xl font-bold text-blackdark leading-7'>
              Payment Method Added Successfully
            </h6>
            <p className='text-lg text-blackdark leading-6 font-normal'>
              Do you want to add another payment method?
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
