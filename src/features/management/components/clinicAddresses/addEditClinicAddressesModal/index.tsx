import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { useGetCitiesByState } from '@/api/city';
import {
  useCreateClinicAddress,
  useGetClinicAddressById,
  useUpdateClinicAddress,
} from '@/api/clinic-addresses';
import { useGetAllCredentialedStates } from '@/api/state';
import { ClinicAddressSchema } from '@/features/management/validation';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import Select from '@/stories/Common/Select';

interface AddEditClinicAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  id?: string;
}

interface ClinicAddressFormValues {
  name: string;
  address: string;
  state_id: { label: string; value: string } | null;
  city_id: { label: string; value: string } | null;
}

const AddEditClinicAddressesModal = ({ isOpen, onClose, id }: AddEditClinicAddressesModalProps) => {
  if (!isOpen) return null;
  const { mutate: createClinicAddress } = useCreateClinicAddress();
  const { data: clinicAddressData, dataUpdatedAt } = useGetClinicAddressById(id);
  const { mutate: updateClinicAddress } = useUpdateClinicAddress();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control,
    watch,
    setValue,
  } = useForm<ClinicAddressFormValues>({
    defaultValues: {
      name: '',
      address: '',
      state_id: null,
      city_id: null,
    },
    mode: 'onChange',
    resolver: yupResolver(ClinicAddressSchema),
  });

  const selectedState = watch('state_id');

  // ** Services **
  const { data: statesData, isLoading: statesLoading } = useGetAllCredentialedStates({
    isCredentialed: true,
  });
  const { data: citiesData } = useGetCitiesByState(selectedState?.value || '', {
    options: { enabled: !!selectedState?.value },
    isCredentialed: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (id && clinicAddressData) {
        reset({
          name: clinicAddressData.name || '',
          address: clinicAddressData.address || '',
          state_id: clinicAddressData.state
            ? { label: clinicAddressData.state.name, value: clinicAddressData.state.id }
            : null,
          city_id: clinicAddressData.city
            ? { label: clinicAddressData.city.name, value: clinicAddressData.city.id }
            : null,
        });
      } else {
        reset({
          name: '',
          address: '',
          state_id: null,
          city_id: null,
        });
      }
    }
  }, [isOpen, id, dataUpdatedAt, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ClinicAddressFormValues) => {
    try {
      const payload = {
        name: data.name,
        address: data.address,
        state_id: data.state_id?.value || '',
        city_id: data.city_id?.value || '',
      };

      if (id) {
        await updateClinicAddress({
          id: id || '',
          data: payload,
        });
      } else {
        await createClinicAddress({
          data: payload,
        });
      }
      handleClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to save clinic address', 'ERROR');
    }
  };

  return (
    <Modal
      title={`${id ? 'Edit' : 'Add'} Clinic Address`}
      isOpen={isOpen}
      onClose={handleClose}
      closeButton={false}
      contentClassName='pt-30px'
      footerClassName='flex items-center justify-end gap-5'
      footer={
        <>
          <Button
            type='button'
            variant='outline'
            title='Cancel'
            isIconFirst
            onClick={handleClose}
            className='rounded-10px !leading-5 !px-6'
          />
          <Button
            type='button'
            variant='filled'
            title='Save'
            onClick={handleSubmit(onSubmit)}
            className='rounded-10px !leading-5 !px-6'
            isDisabled={!isDirty}
          />
        </>
      }
      id='add-edit-clinic-addresses-modal'
    >
      <div className='flex flex-col gap-5'>
        <InputField
          label='Name'
          name='name'
          register={register}
          error={errors.name?.message}
          type='text'
          placeholder='Enter Clinic Name'
          isRequired
          labelClass='!text-base'
          inputClass='!text-base !leading-5'
        />
        <InputField
          label='Address Line'
          name='address'
          register={register}
          error={errors.address?.message}
          type='text'
          placeholder='Enter Address Line'
          labelClass='!text-base'
          inputClass='!text-base !leading-5'
          isRequired
        />
        <Select
          label='State'
          name='state_id'
          control={control}
          options={statesData?.length ? statesData : [{ value: '', label: 'No states available' }]}
          placeholder='Select State'
          error={errors.state_id?.message}
          isRequired
          labelClassName='!text-base'
          onChange={selected => {
            setValue('state_id', selected);
            setValue('city_id', null); // Reset city when state changes
          }}
          isLoading={statesLoading}
          portalRootId='add-edit-clinic-addresses-modal'
          StylesConfig={{
            control: () => ({
              minHeight: '50px',
            }),
            singleValue: () => ({
              fontSize: '16px',
            }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
        />

        <Select
          label='City'
          name='city_id'
          control={control}
          options={
            citiesData?.length ? citiesData : [{ value: '', label: 'No cities for selected state' }]
          }
          placeholder='Select City'
          error={errors.city_id?.message}
          isRequired
          labelClassName='!text-base'
          isDisabled={!selectedState}
          portalRootId='add-edit-clinic-addresses-modal'
          StylesConfig={{
            control: () => ({
              minHeight: '50px',
            }),
            singleValue: () => ({
              fontSize: '16px',
            }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
        />
      </div>
    </Modal>
  );
};

export default AddEditClinicAddressesModal;
