import { useSelector } from 'react-redux';

import type { PaymentProfileDetails } from '@/api/types/payment.dto';
import { usePaymentMethodForm } from '@/features/payment/hooks/usePaymentMethodForm';
import { getMonthOptions, getYearOptions } from '@/features/payment/utils/paymentHelpers';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import Select, { type SelectOption } from '@/stories/Common/Select';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
  closeButton?: boolean;
  onSuccess?: () => void;
  paymentProfileDetails?: PaymentProfileDetails | null;
  isEditMode?: boolean;
}

export const AddPaymentMethodModal = ({
  isOpen,
  onClose,
  clientId,
  closeButton = true,
  onSuccess,
  isEditMode = false,
  paymentProfileDetails,
}: AddPaymentMethodModalProps) => {
  const { client_id } = useSelector(currentUser);
  const { form, onSubmit, isSubmitting, isPendingUpdatePaymentProfile } = usePaymentMethodForm({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    client_id: client_id || clientId,
    paymentProfileDetails,
    isEditMode,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form;

  const handleClose = () => {
    reset();
    onClose();
  };

  const months = getMonthOptions();
  const years = getYearOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Update Payment Method' : 'Add Payment Method'}
      size='sm'
      contentClassName='pt-30px'
      id='add-payment-method-modal'
      closeButton={closeButton}
      footerClassName='flex items-center gap-5 justify-end'
      footer={
        <Button
          variant='filled'
          title={isEditMode ? 'Update Card' : 'Add Card'}
          onClick={handleSubmit(onSubmit)}
          isLoading={isEditMode ? isPendingUpdatePaymentProfile : isSubmitting}
          className='rounded-10px !px-6 min-h-50px'
        />
      }
    >
      <div className='flex flex-col gap-5'>
        <InputField
          register={register}
          name='cardNumber'
          type='text'
          label='Card Number'
          labelClass='!text-base'
          isRequired={true}
          placeholder='1234 5678 9012 3456'
          error={errors.cardNumber?.message}
          inputClass='!text-base !leading-5'
        />
        <div className='flex flex-col gap-1.5'>
          <label className='text-blackdark text-base font-normal block leading-5'>
            Expiration Date <span className='text-red-500'>*</span>
          </label>
          <div className='grid grid-cols-2 gap-5'>
            <Select
              name='expirationMonth'
              placeholder='Select Month'
              options={months}
              error={errors.expirationMonth?.message}
              isClearable={false}
              portalRootId='add-payment-method-modal'
              onChange={value => {
                setValue('expirationMonth', value as SelectOption, { shouldValidate: true });
              }}
              StylesConfig={{
                control: () => ({
                  minHeight: '50px',
                  fontSize: '16px',
                  lineHeight: '20px',
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
              portalRootId='add-payment-method-modal'
              onChange={value => {
                setValue('expirationYear', value as SelectOption, { shouldValidate: true });
              }}
              StylesConfig={{
                control: () => ({
                  minHeight: '50px',
                  fontSize: '16px',
                  lineHeight: '20px',
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
          {!paymentProfileDetails?.defaultPaymentProfile && (
            <CheckboxField
              id='defaultPaymentProfile'
              label='Set as default payment method'
              labelClass='whitespace-nowrap !text-base !leading-4'
              {...register('defaultPaymentProfile')}
              onChange={e => {
                setValue('defaultPaymentProfile', e.target.checked as boolean, {
                  shouldValidate: true,
                });
              }}
              isChecked={form.watch('defaultPaymentProfile')}
            />
          )}
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
      </div>
    </Modal>
  );
};
