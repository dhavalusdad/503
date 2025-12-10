import React, { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment-timezone';
import { Controller, useForm } from 'react-hook-form';

import { userQueryKey } from '@/api/common/user.queryKey';
// import type { CreatePatientRequest } from '@/api/types';
import type { CreatePatientRequest } from '@/api/types/user.dto';
import { useCheckEmailExists, useCreateNewPatient } from '@/api/user';
import type { CreatePatientFormValues } from '@/features/calendar/types';
import { createPatientSchema } from '@/features/calendar/validationSchema/ScheduleAppointmentSchema';
import { useDebounce } from '@/hooks/useDebounce';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';

interface AddPatientFormProps {
  timezone: string;
  onPatientCreated: (patientId: string) => void;
}

const AddPatientForm: React.FC<AddPatientFormProps> = ({ timezone, onPatientCreated }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: mutationCreateNewPatient, isPending: isCreatingPatient } =
    useCreateNewPatient({});

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    setValue,
    control,
    watch,
    clearErrors,
  } = useForm<CreatePatientFormValues>({
    resolver: yupResolver(createPatientSchema),
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      dob: '',
    },
  });

  const emailValue = watch('email');
  const deferredEmail = useDebounce(emailValue, 500);

  const { data: emailExists } = useCheckEmailExists(deferredEmail);

  useEffect(() => {
    if (emailExists) {
      setValue('first_name', emailExists?.user?.first_name);
      setValue('last_name', emailExists?.user?.last_name);
    }
  }, [emailExists]);

  const onSubmit = async (data: CreatePatientRequest) => {
    if (emailExists) {
      onPatientCreated(emailExists.id);
      return;
    }

    try {
      const res = await mutationCreateNewPatient(data);
      queryClient.invalidateQueries({ queryKey: userQueryKey.getPatientList() });
      const clientId = res?.data?.client?.id;
      onPatientCreated(clientId);
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  return (
    <div className='p-5 bg-Gray rounded-2xl flex flex-col gap-5'>
      <InputField
        register={register}
        type='text'
        name='first_name'
        label='First name'
        labelClass='!text-base !leading-22px'
        inputClass='!text-base !leading-6 !p-3 bg-white'
        placeholder='Enter patient First Name'
        error={errors.first_name?.message}
        isRequired={true}
      />
      <InputField
        type='text'
        register={register}
        name='last_name'
        label='Last Name'
        labelClass='!text-base !leading-22px'
        inputClass='!text-base !leading-6 !p-3 bg-white'
        placeholder='Enter patient Last Name'
        error={errors.last_name?.message}
        isRequired={true}
      />
      <InputField
        register={register}
        name='email'
        label='Email Address'
        required
        type='email'
        labelClass='!text-base !leading-22px'
        inputClass='!text-base !leading-6 !p-3 bg-white'
        placeholder='Enter Patient Email'
        error={errors.email?.message}
        isRequired={true}
      />
      {emailExists && emailExists?.is_active && (
        <span className='text-center text-green-600'>
          This user is already existing in our portal
        </span>
      )}

      {emailExists && !emailExists?.is_active && (
        <span className='text-center text-red-600'>This user is inactive in our portal</span>
      )}

      {!emailExists && (
        <>
          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <PhoneField
                name='phone'
                isRequired
                value={field.value}
                onChange={field.onChange}
                label='Contact Number'
                country='us'
                enableSearch
                error={errors.phone?.message}
                isReadOnly={false}
                isModal={false}
                labelClass='!text-base !leading-22px'
                inputClass='!text-base !leading-6 !p-3 bg-white'
              />
            )}
          />
          <CustomDatePicker
            isRequired
            label='Date of Birth'
            labelClass='!text-base !leading-22px'
            placeholderText='Select Patient Date Of Birth'
            parentClassName='add-patient-datepicker'
            error={errors.dob?.message}
            selected={
              getValues('dob') && moment(getValues('dob')).isValid()
                ? moment(getValues('dob')).toDate()
                : ''
            }
            onChange={date =>
              setValue('dob', date ? moment.tz(date, timezone).format('YYYY-MM-DD') : undefined, {
                shouldValidate: true,
              })
            }
            maxDate={new Date()}
          />
        </>
      )}
      <Button
        variant='filled'
        title={emailExists ? 'Next' : 'Save'}
        type='submit'
        isDisabled={(!isValid && !emailExists) || (emailExists && !emailExists?.is_active)}
        isLoading={isCreatingPatient}
        onClick={() => {
          if (emailExists) {
            clearErrors(['phone', 'dob']);
            onSubmit({} as CreatePatientRequest);
          } else {
            handleSubmit(onSubmit)();
          }
        }}
        parentClassName='w-full'
        className='w-full !font-semibold rounded-lg'
      />
    </div>
  );
};

export default AddPatientForm;
