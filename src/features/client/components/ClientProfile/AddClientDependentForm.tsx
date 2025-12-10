import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { Controller, useForm } from 'react-hook-form';

import { useCreateDependent, useGetDependentById, useUpdateDependentUser } from '@/api/dependents';
import { GENDER_OPTION, RELATIONSHIP_OPTIONS } from '@/constants/CommonConstant';
import type { RelationEnum } from '@/enums';
import type { DependentFormValues } from '@/features/client/types';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Drawer from '@/stories/Common/Drawer';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';

import { dependentValidationSchema } from '../../validationSchema/dependentValidation';

interface ClientDependentFormProps {
  relationship?: RelationEnum;
  mode?: 'create' | 'view' | 'edit';
  selectedDependentId?: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setMode?: (currentMode: 'create' | 'view' | 'edit') => void;
  setSelectedDependentId?: (currentDependentId: string | null) => void;
  patient_id?: string;
}

export const AddClientDependentForm = ({
  relationship,
  isOpen = false,
  mode,
  selectedDependentId,
  setIsOpen,
  setMode,
  setSelectedDependentId,
  patient_id,
}: ClientDependentFormProps) => {
  const { mutateAsync: createDependent, isPending: isCreateDependentApiPending } =
    useCreateDependent();
  const { mutateAsync: updateUserDependent, isPending: isUpdateDependentApiPending } =
    useUpdateDependentUser();

  const { data: dependentDetails } = useGetDependentById(selectedDependentId || '');

  const initialFormValues: DependentFormValues = {
    relationship: relationship ? relationship : undefined,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<DependentFormValues>({
    resolver: yupResolver(dependentValidationSchema),
    mode: 'all',
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    if (relationship) {
      setValue('relationship', relationship);
    }
  }, [relationship]);

  useEffect(() => {
    if ((mode === 'view' || mode === 'edit') && dependentDetails) {
      const fullName = dependentDetails?.user?.full_name || '';
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest?.join(' ');

      reset({
        relationship: dependentDetails?.relationship as RelationEnum,
        first_name: firstName || '',
        last_name: lastName || '',
        email: dependentDetails?.user?.email || '',
        phone: dependentDetails?.user?.phone || '',
        dob: dependentDetails?.user?.dob ? moment(dependentDetails?.user?.dob) : undefined,
        gender: dependentDetails?.user?.gender,
      });
    }
  }, [mode, dependentDetails, selectedDependentId]);

  const createOrUpdateUserDependent = async () => {
    const vals = getValues();
    const payload = {
      first_name: vals.first_name.trim(),
      last_name: vals.last_name.trim(),
      phone: vals.phone.trim(),
      email: vals.email.trim(),
      dob: vals.dob,
      gender: vals.gender,
      relationship: vals.relationship,
    };

    const { first_name, last_name, phone, email, dob, gender, relationship } = payload;

    if (selectedDependentId) {
      await updateUserDependent({
        user_id: selectedDependentId || '',
        data: {
          patient_id,
          first_name,
          last_name,
          phone,
          email,
          dob,
          gender,
          relationship,
        },
      });
    } else {
      await createDependent({
        first_name,
        last_name,
        phone,
        email,
        dob,
        gender,
        relationship,
        patient_id,
      });
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (mode === 'create') {
      reset(initialFormValues);
    }
  }, []);

  const isReadOnly = mode === 'view';

  return (
    <>
      <Drawer
        width='w-471px'
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          if (setSelectedDependentId) setSelectedDependentId(null);
          if (setMode) setMode('create');
          reset(initialFormValues);
        }}
        id='dependent-drawer'
        title={isReadOnly ? 'View Dependent' : mode === 'edit' ? 'Edit Dependent' : 'Add Dependent'}
        footerClassName='!justify-end'
        footer={
          <>
            {!isReadOnly && (
              <Button
                variant='filled'
                title={`${selectedDependentId ? 'Update' : 'Add'} Now`}
                className='rounded-10px rounded-lg'
                type='button'
                isDisabled={!isDirty || isCreateDependentApiPending || isUpdateDependentApiPending}
                onClick={handleSubmit(createOrUpdateUserDependent)}
                isLoading={isCreateDependentApiPending || isUpdateDependentApiPending}
              />
            )}
          </>
        }
      >
        <>
          {!relationship && (
            <Controller
              name='relationship'
              control={control}
              render={({ field }) => (
                <Select
                  label='Relationship'
                  options={RELATIONSHIP_OPTIONS}
                  placeholder='Select Relationship'
                  parentClassName=''
                  labelClassName='!text-base !leading-22px'
                  value={RELATIONSHIP_OPTIONS.find(option => option.value === field.value) || null}
                  onChange={value => {
                    if (value && 'value' in value) {
                      field.onChange(value.value as RelationEnum);
                    } else {
                      field.onChange(undefined);
                    }
                  }}
                  isDisabled={isReadOnly}
                  StylesConfig={{
                    control: () => ({
                      minHeight: '50px',
                      background: '#F6F5F4',
                      backgroundColor: '#E8ECF3',
                    }),
                    singleValue: () => ({
                      fontSize: '16px',
                      lineHeight: '22px',
                    }),
                    placeholder: () => ({
                      fontSize: '16px',
                      lineHeight: '22px',
                    }),
                    option: () => ({
                      fontSize: '16px',
                    }),
                  }}
                />
              )}
            />
          )}

          {(watch('relationship') || relationship) && (
            <div className='flex flex-col gap-5 mt-5'>
              <InputField
                type='text'
                label='First Name'
                labelClass='!text-base !leading-5'
                register={register}
                error={errors.first_name?.message}
                isRequired={true}
                placeholder='Enter First Name'
                name='first_name'
                parentClassName=''
                inputClass={'!text-base !leading-5 '}
                isDisabled={isReadOnly}
              />

              <InputField
                type='text'
                label='Last Name'
                labelClass='!text-base !leading-5'
                register={register}
                name='last_name'
                error={errors.last_name?.message}
                isRequired={true}
                parentClassName=''
                placeholder='Enter Last Name'
                inputClass={'!text-base !leading-5 '}
                isDisabled={isReadOnly}
              />

              <CustomDatePicker
                label='Date of Birth'
                labelClass='!text-base !leading-5'
                selected={
                  getValues('dob') && moment(getValues('dob')).isValid()
                    ? moment(getValues('dob')).toDate()
                    : ''
                }
                onChange={date => setValue('dob', moment(date), { shouldValidate: true })}
                error={errors.dob?.message}
                maxDate={new Date()}
                isRequired={true}
                parentClassName='z-[0]'
                className='!py-3'
                disabled={isReadOnly}
              />

              <PhoneField
                label='Contact Number'
                labelClass='!text-base !leading-5'
                value={getValues('phone') || ''}
                name='phone'
                onChange={formattedValue => {
                  setValue('phone', formattedValue, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                isRequired={true}
                error={errors.phone?.message}
                placeholder='Contact number'
                inputClass={` !text-base !leading-5 !p-3.5 ${errors.phone && errors.phone.message ? 'border-red-500' : ''} `}
                buttonClass=''
                disabled={isReadOnly}
              />

              <InputField
                type='email'
                label='Email'
                labelClass='!text-base !leading-5'
                register={register}
                name='email'
                error={errors.email?.message}
                isRequired={true}
                parentClassName=''
                placeholder='Email'
                inputClass={'!text-base !leading-5 '}
                isDisabled={isReadOnly}
              />

              <Select
                options={GENDER_OPTION}
                isRequired={true}
                label='Gender'
                labelClassName='!text-base !leading-22px'
                value={GENDER_OPTION.find(option => option.value === getValues('gender'))}
                placeholder='Select Gender'
                onChange={value => {
                  if (value && 'value' in value) {
                    setValue('gender', value.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                }}
                error={errors.gender?.message}
                parentClassName=''
                isDisabled={isReadOnly}
                portalRootId='dependent-drawer'
                StylesConfig={{
                  control: () => ({
                    minHeight: '50px',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                    lineHeight: '20px',
                  }),
                  placeholder: () => ({
                    fontSize: '16px',
                    lineHeight: '20px',
                  }),
                  menu: () => ({
                    zIndex: '60',
                  }),
                  option: () => ({
                    fontSize: '16px',
                    lineHeight: '20px',
                  }),
                }}
              />
            </div>
          )}
        </>
      </Drawer>
    </>
  );
};
