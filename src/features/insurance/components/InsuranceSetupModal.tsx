import { useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, type FieldValues, type UseFormRegister } from 'react-hook-form';
import * as yup from 'yup';

import { insuranceQueryKey } from '@/api/common/insurance';
import { getAllInsurancesAsync, useCreateInsurance } from '@/api/insurance';
import {
  InsuranceType,
  insuranceTypeOptions,
} from '@/pages/Preferences/components/AddInsuranceModal';
import Button from '@/stories/Common/Button';
import { Icon } from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';
import { Modal } from '@/stories/Common/Modal';
import { CustomAsyncSelect, type SelectOption } from '@/stories/Common/Select';

interface InsuranceFormData {
  carrier: SelectOption | null;
  member_id: string;
  insurance_type: SelectOption | null;
  group_id: string | null;
  first_name: string;
  last_name: string;
}

// Validation schema for insurance form
const insuranceValidationSchema = yup.object().shape({
  carrier: yup
    .mixed<SelectOption>()
    .nullable()
    .required('Insurance provider is required')
    .test('is-select-option', 'Insurance provider is required', value => {
      return (
        value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        'value' in value &&
        'label' in value
      );
    }),
  member_id: yup.string().required('Member ID is required').trim(),
  insurance_type: yup
    .mixed<SelectOption>()
    .nullable()
    .required('Insurance type is required')
    .test('is-select-option', 'Insurance type is required', value => {
      return (
        value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        'value' in value &&
        'label' in value
      );
    }),
  first_name: yup.string().required('First Name  is required').trim(),
  last_name: yup.string().required('Last Name  is required').trim(),
  group_id: yup.string().notRequired().optional(),
});

export const InsuranceSetupModal = ({
  isOpen,
  onClose,
  clientId,
}: {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}) => {
  const [showAddSecondaryPrompt, setShowAddSecondaryPrompt] = useState(false);
  const [hasOpenedSecondaryAttempt, setHasOpenedSecondaryAttempt] = useState(false);
  const primaryTypeOption =
    insuranceTypeOptions.find(option => option.value === InsuranceType.PRIMARY) ?? null;
  const secondaryTypeOption =
    insuranceTypeOptions.find(option => option.value === InsuranceType.SECONDARY) ?? null;
  const [currentInsuranceTypeOption, setCurrentInsuranceTypeOption] = useState<SelectOption | null>(
    primaryTypeOption
  );

  const { mutateAsync: createInsurance, isPending: isSaving } = useCreateInsurance(clientId);

  const {
    handleSubmit,
    setValue,
    getValues,
    reset,
    register,
    formState: { errors },
  } = useForm<InsuranceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(insuranceValidationSchema) as any,
    defaultValues: {
      carrier: null,
      member_id: '',
      first_name: '',
      last_name: '',
      insurance_type: primaryTypeOption,
      group_id: null,
    },
  });
  const registerInputField = register as unknown as UseFormRegister<FieldValues>;

  const buildInsurancePayload = (data: InsuranceFormData) => {
    if (!data.carrier || !data.insurance_type) {
      return null;
    }

    return {
      client_id: clientId,
      carrier_code: data.carrier.value?.toString() || '',
      carrier_name: data.carrier.label || '',
      member_id: data.member_id,
      group_id: data.group_id || undefined,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      insurance_type: (data.insurance_type.value || '') as InsuranceType,
      on_boarding: true,
    };
  };

  const resetFormState = (typeOverride?: SelectOption | null) => {
    const nextType = typeOverride ?? currentInsuranceTypeOption ?? primaryTypeOption;
    setCurrentInsuranceTypeOption(nextType);
    reset({
      carrier: null,
      member_id: '',
      insurance_type: nextType,
      first_name: '',
      last_name: '',
      group_id: null,
    });
  };

  const closeModalAndReset = () => {
    setShowAddSecondaryPrompt(false);
    setHasOpenedSecondaryAttempt(false);
    resetFormState(primaryTypeOption);
    onClose();
  };

  const handleSuccessfulSave = () => {
    if (hasOpenedSecondaryAttempt) {
      closeModalAndReset();
      return;
    }

    setShowAddSecondaryPrompt(true);
  };

  const handleSave = handleSubmit(async data => {
    try {
      const insurancePayload = buildInsurancePayload(data);
      if (!insurancePayload) {
        return;
      }

      await createInsurance(insurancePayload);
      resetFormState();
      handleSuccessfulSave();
    } catch (error) {
      console.error('Failed to save insurance:', error);
    }
  });

  const handleAddSecondaryConfirmed = () => {
    setHasOpenedSecondaryAttempt(true);
    setShowAddSecondaryPrompt(false);
    resetFormState(secondaryTypeOption);
  };

  const handleDeclineAddSecondary = () => {
    closeModalAndReset();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showAddSecondaryPrompt}
        onClose={closeModalAndReset}
        title={hasOpenedSecondaryAttempt ? 'Add Secondary Insurance' : 'Insurance Setup'}
        size='lg'
        id='insurance-modal'
        closeButton={hasOpenedSecondaryAttempt}
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
          <CustomAsyncSelect
            key='insurance-carrier'
            label='Insurance Provider'
            isRequired={true}
            placeholder='Select Insurance Provider'
            loadOptions={getAllInsurancesAsync}
            queryKey={insuranceQueryKey.getAllInsurances()}
            value={getValues('carrier')}
            onChange={value => {
              setValue('carrier', value as SelectOption, { shouldValidate: true });
            }}
            error={errors.carrier?.message}
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
                padding: '4px 6px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
            labelClassName='!text-base'
            portalRootId='insurance-modal'
            isClearable
          />
          <InputField
            type='text'
            label='Member ID'
            labelClass='!text-base'
            inputClass='!text-base !leading-5'
            placeholder='Enter member ID'
            name='member_id'
            register={registerInputField}
            error={errors.member_id?.message}
          />
          <InputField
            type='text'
            label='Group ID'
            labelClass='!text-base'
            inputClass='!text-base !leading-5'
            placeholder='Enter group ID'
            name='group_id'
            register={registerInputField}
            error={errors.group_id?.message}
          />
        </div>
        <div className='flex w-full gap-2 mt-5 mb-2'>
          <InputField
            type='text'
            label='First Name'
            labelClass='!text-base'
            inputClass='!text-base !leading-5'
            parentClassName='w-full'
            placeholder='Enter First Name'
            name='first_name'
            register={registerInputField}
            error={errors.first_name?.message}
          />
          <InputField
            type='text'
            label='Last Name'
            labelClass='!text-base'
            inputClass='!text-base !leading-5'
            parentClassName='w-full'
            placeholder='Enter Last Name'
            name='last_name'
            register={registerInputField}
            error={errors.last_name?.message}
          />
        </div>
        <p className={'text-xs flex items-center gap-1 text-gray-500 '}>
          <Icon name='info' width={14} height={13} />
          Please enter your first and last name in the same format shown on your latest insurance
          card.
        </p>
      </Modal>

      <Modal
        isOpen={showAddSecondaryPrompt}
        onClose={handleDeclineAddSecondary}
        title=''
        size='xs'
        id='add-secondary-insurance-modal'
        closeButton={false}
        contentClassName='pt-30px'
        footerClassName='flex gap-5 w-full'
        footer={
          <>
            <Button
              variant='outline'
              title='No'
              onClick={handleDeclineAddSecondary}
              className='rounded-10px !px-8 min-h-50px !w-full !font-bold'
              parentClassName='w-2/4'
            />
            <Button
              variant='filled'
              title='Yes'
              onClick={handleAddSecondaryConfirmed}
              isDisabled={hasOpenedSecondaryAttempt}
              className='rounded-10px !px-8 min-h-50px !w-full !font-bold'
              parentClassName='w-2/4'
            />
          </>
        }
      >
        <div className='flex flex-col items-center text-center gap-5'>
          <Icon name='tickcircle' className='inline-block text-Green' />
          <div className='flex flex-col gap-1.5'>
            <p className='text-xl font-bold text-blackdark leading-7'>
              Insurance Added Successfully
            </p>
            <p className='text-lg text-blackdark leading-6 font-normal'>
              Do you want to add Secondary insurance?
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
