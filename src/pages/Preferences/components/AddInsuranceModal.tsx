import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { insuranceQueryKey } from '@/api/common/insurance';
import {
  getAllInsurancesAsync,
  useCreateInsurance,
  useUpdateInsurance,
  type InsuranceData,
} from '@/api/insurance';
import type { SelectOption } from '@/features/calendar/types';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import Select, { CustomAsyncSelect } from '@/stories/Common/Select';

export enum InsuranceType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}

export const insuranceTypeOptions = [
  { value: InsuranceType.PRIMARY, label: 'Primary' },
  { value: InsuranceType.SECONDARY, label: 'Secondary' },
  { value: InsuranceType.TERTIARY, label: 'Tertiary' },
];
interface AddInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  insuranceData?: InsuranceData | null;
  appointmentId?: string;
  onSuccess?: () => void;
}

interface InsuranceFormData {
  carrier: SelectOption | null;
  insurance_type: InsuranceType;
  member_id: string;
  first_name: string;
  last_name: string;
  group_id?: string;
}

const validationSchema = yup.object().shape({
  carrier: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.mixed<string | number>().required(),
    })
    .nullable()
    .required('Insurance provider is required') as yup.Schema<SelectOption | null>,
  member_id: yup.string().required('Member ID is required'),
  group_id: yup.string().notRequired().optional(),
  insurance_type: yup
    .string()
    .oneOf([InsuranceType.PRIMARY, InsuranceType.SECONDARY, InsuranceType.TERTIARY])
    .required('Insurance Type is required') as yup.Schema<InsuranceType>,
  first_name: yup.string().required('First Name is required'),
  last_name: yup.string().required('Last Name is required'),
});

const AddInsuranceModal = ({
  isOpen,
  onClose,
  clientId,
  insuranceData,
  appointmentId,
  onSuccess,
}: AddInsuranceModalProps) => {
  const isEditMode = !!insuranceData;

  const {
    handleSubmit,
    setValue,
    getValues,
    reset,
    register,
    formState: { errors },
  } = useForm<InsuranceFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      carrier: null,
      member_id: '',
      group_id: '',
      first_name: '',
      last_name: '',
      insurance_type: InsuranceType['PRIMARY'],
    },
  });

  const { mutateAsync: createInsurance, isPending: isCreating } = useCreateInsurance(
    clientId,
    appointmentId
  );
  const { mutateAsync: updateInsurance, isPending: isUpdating } = useUpdateInsurance(clientId);
  const isPending = isCreating || isUpdating;

  const onSubmit = async (data: InsuranceFormData) => {
    if (!data.carrier) return;

    try {
      if (isEditMode && insuranceData) {
        await updateInsurance({
          id: insuranceData.id,
          data: {
            insurance_type: data.insurance_type,
            group_id: data.group_id || undefined,
            first_name: data.first_name,
            last_name: data.last_name,
          },
        });
      } else {
        await createInsurance({
          client_id: clientId,
          carrier_code: data.carrier.value.toString(),
          carrier_name: data.carrier.label,
          member_id: data.member_id,
          group_id: data.group_id || undefined,
          insurance_type: data.insurance_type,
          first_name: data.first_name,
          last_name: data.last_name,
        });
      }
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} insurance:`, error);
    }
  };

  useEffect(() => {
    if (isOpen && insuranceData) {
      // Pre-populate form with existing data in edit mode
      setValue('carrier', {
        label: insuranceData.carrier?.carrier_name,
        value: insuranceData.carrier?.id,
      });
      setValue('member_id', insuranceData.member_id);
      setValue('group_id', insuranceData.group_id || '');
      setValue('insurance_type', insuranceData.insurance_type);
      setValue('first_name', insuranceData.first_name || '');
      setValue('last_name', insuranceData.last_name || '');
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen, insuranceData, setValue, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Insurance' : 'Add Insurance'}
      size='sm'
      closeButton={false}
      contentClassName='pt-30px'
      id='insurance-modal'
      footerClassName='flex items-center justify-end gap-5 pt-30px border-t border-solid border-surface'
      footer={
        <>
          <Button
            variant='outline'
            title='Cancel'
            onClick={() => {
              reset();
              onClose();
            }}
            className='rounded-10px !leading-5 !px-6'
          />
          <Button
            variant='filled'
            title={isEditMode ? 'Update Insurance' : 'Add Insurance'}
            onClick={handleSubmit(onSubmit)}
            isLoading={isPending}
            className='rounded-10px !leading-5 !px-6'
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
          isDisabled={isEditMode}
        />
        <InputField
          type='text'
          label='Member ID'
          labelClass='!text-base'
          inputClass='!text-base !leading-5'
          placeholder='Enter member ID'
          name='member_id'
          register={register}
          error={errors.member_id?.message}
          isDisabled={isEditMode}
        />
        <InputField
          type='text'
          label='Group ID'
          labelClass='!text-base'
          inputClass='!text-base !leading-5'
          placeholder='Enter group ID'
          name='group_id'
          register={register}
          error={errors.group_id?.message}
        />
        <Select
          key={'insurance'}
          name={'insurance_type'}
          label={'Insurance Type'}
          options={[InsuranceType.PRIMARY, InsuranceType.SECONDARY, InsuranceType.TERTIARY].map(
            d => ({ value: d, label: d })
          )}
          value={
            getValues('insurance_type')
              ? {
                  value: getValues('insurance_type'),
                  label: getValues('insurance_type'),
                }
              : null
          }
          onChange={selected => {
            const value = selected as { value: InsuranceType; label: string } | null;
            if (value) {
              setValue('insurance_type', value.value, { shouldValidate: true });
            }
          }}
          placeholder={`Select Insurance Type`}
          labelClassName='!text-base'
          error={errors.insurance_type?.message}
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
          isClearable
        />
        <div className='grid grid-cols-2 gap-5'>
          <InputField
            type='text'
            label='First Name'
            labelClass='!text-base'
            inputClass='!text-base !leading-5'
            parentClassName='w-full'
            placeholder='Enter First Name'
            name='first_name'
            register={register}
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
            register={register}
            error={errors.last_name?.message}
          />
        </div>
        <p className={'text-xs flex items-center gap-1 text-gray-500 '}>
          <Icon name='info' width={14} height={13} />
          Please enter your first and last name in the same format shown on your latest insurance
          card.
        </p>
      </div>
    </Modal>
  );
};

export default AddInsuranceModal;
