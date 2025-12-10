import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import type { AddMemberFormProps } from '@/features/appointment/component/ClientAppointmentsBooking/types';
import { getMemberSchema } from '@/features/appointment/component/ClientAppointmentsBooking/validationSchema';
import type { SelectOption } from '@/features/calendar/types';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  memberType,
  onSave,
  onCancel,
  genderOptions,
  getFormValue,
  setValue: setFormValues,
}) => {
  const { timezone } = useSelector(currentUser);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(getMemberSchema(memberType)),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      age: '',
      phone: '',
      email: '',
      emergencyContact: '',
      relationshipType: '',
    },
  });

  const selectStyles = {
    control: () => ({
      minHeight: '46px',
      padding: '8px 10px',
    }),
    input: () => ({
      fontSize: '16px',
    }),
    singleValue: () => ({
      fontSize: '16px',
    }),
    option: () => ({
      fontSize: '16px',
    }),
  };

  const onSubmit = data => {
    onSave(data);
    setFormValues('selectedMemberCount', getFormValue('selectedMemberCount') + 1, {
      shouldValidate: true,
    });
    reset();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };
  const relationshipOptions = [
    { label: 'Son', value: 'Son' },
    { label: 'Daughter', value: 'Daughter' },
    { label: 'Other', value: 'Other' },
  ];

  // Member-specific fields
  const renderMemberSpecificFields = () => {
    switch (memberType) {
      case 'family':
        return (
          <>
            <PhoneField
              name={`new${memberType}MemberPhone`}
              value={getValues('phone')}
              onChange={value => setValue('phone', value, { shouldValidate: true })}
              label='Contact Number'
              country='us'
              enableSearch
              isReadOnly={false}
              labelClass='!text-base'
              isModal={false}
              inputClass='!text-base !leading-6 !p-3 bg-white'
              buttonClass='Register_Btn_Class'
              error={errors.phone?.message}
            />

            <InputField
              type='email'
              label='Email'
              placeholder='Email'
              inputClass='bg-white text-[16px]'
              labelClass='!text-base'
              name='email'
              register={register}
              error={errors.email?.message}
            />
          </>
        );
      case 'minor':
        return (
          <>
            <Select
              label='Relationship Type'
              labelClassName='!text-base'
              options={relationshipOptions}
              onChange={value => {
                const selectedValue = value as SelectOption;
                setValue('relationshipType', selectedValue?.value, { shouldValidate: true });
              }}
              StylesConfig={selectStyles}
            />
            <PhoneField
              name={`emergencyContact`}
              value={getValues('emergencyContact')}
              onChange={value => setValue('emergencyContact', value, { shouldValidate: true })}
              label='Emergency Contact'
              country='us'
              enableSearch
              isReadOnly={false}
              isModal={false}
              inputClass='!text-base !leading-6 !p-3 bg-white'
              buttonClass='Register_Btn_Class'
              error={errors.emergencyContact?.message}
            />
          </>
        );
      default:
        return null;
    }
  };

  // const maxAllowed = memberType === 'couple' ? 1 : memberCount;
  // if (Number(currentCount) >= maxAllowed) return null;
  return (
    <>
      <div className='flex items-center flex-row w-full justify-between mb-5'>
        <h5 className='text-base font-bold flex leading-22px text-blackdark'>
          Add{' '}
          {memberType === 'family'
            ? 'Family'
            : memberType === 'couple'
              ? 'Couple'
              : memberType === 'minor'
                ? 'Minor'
                : 'Member'}{' '}
          Details
        </h5>
        {memberType !== 'couple' && (
          <div className='flex'>
            <Button
              type='button'
              variant='filled'
              icon={<Icon name='plus' width={14} height={14} />}
              isIconFirst={true}
              title='Add Member'
              className='rounded-10px bg-primary text-white px-6 !font-bold'
              onClick={() => {
                setFormValues('selectedMemberCount', getFormValue('selectedMemberCount') + 1, {
                  shouldValidate: true,
                });
              }}
            />
          </div>
        )}
      </div>{' '}
      <div className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-25px gap-y-5'>
        <InputField
          type='text'
          label='First Name'
          placeholder='First Name'
          inputClass='bg-white text-[16px]'
          name='firstName'
          register={register}
          error={errors.firstName?.message}
        />

        <InputField
          type='text'
          label='Last Name'
          placeholder='Last Name'
          inputClass='bg-white text-[16px]'
          name='lastName'
          register={register}
          error={errors.lastName?.message}
        />

        <CustomDatePicker
          selected={
            getValues('dateOfBirth')
              ? moment.tz(getValues('dateOfBirth'), timezone).toDate()
              : moment.tz(new Date(), timezone).toDate()
          }
          onChange={value => {
            if (value instanceof Date) {
              const dateValue = moment.tz(value, timezone).format('YYYY-MM-DD');
              setValue('dateOfBirth', dateValue, { shouldValidate: true });
              const today = moment.tz(new Date(), timezone);
              const birthDate = moment.tz(value, timezone);
              const age = today.diff(birthDate, 'years');
              setValue('age', age.toString(), { shouldValidate: true });
            }
          }}
          label='Date of Birth'
          maxDate={moment.tz(new Date(), timezone).toDate()}
          dateFormat='dd/MM/yyyy'
          placeholderText='Select date of birth'
          className='bg-white text-[16px] !p-[14px]'
          error={errors.dateOfBirth?.message || errors.age?.message}
        />

        <Select
          label='Gender'
          labelClassName='!text-base'
          options={genderOptions}
          value={genderOptions.find(option => option.value === getValues('gender')) || null}
          onChange={value =>
            setValue('gender', (value as SelectOption)?.value || '', { shouldValidate: true })
          }
          error={errors.gender?.message}
          StylesConfig={selectStyles}
        />
        {renderMemberSpecificFields()}
        <InputField
          type='number'
          label='Age'
          name='age'
          isDisabled={true}
          min={0}
          placeholder='Age'
          labelClass='!text-base'
          inputClass='bg-white text-[16px]'
          register={register}
          infoIcon={true}
          info='Age will be calculated automatically based on date of birth'
        />
      </div>
      <div className='flex items-center gap-5 pt-5 mt-5 border-t border-solid border-surface'>
        <Button
          type='button'
          variant='outline'
          title='Cancel'
          className='rounded-10px px-6 !font-bold'
          onClick={handleCancel}
        />
        <Button
          type='submit'
          variant='none'
          title='Save'
          onClick={handleSubmit(onSubmit)}
          className='rounded-10px px-6 bg-[#2E3139] text-white !font-bold'
        />
      </div>
    </>
  );
};

export default AddMemberForm;
