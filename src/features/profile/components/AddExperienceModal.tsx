import React, { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
import { type FieldErrors, type Resolver, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import {
  useCreateTherapistExperience,
  useGetTherapistExperience,
  useUpdateTherapistExperience,
} from '@/api/therapist-experience';
import { MONTHS, YEARS } from '@/constants/CommonConstant';
import { experienceSchema } from '@/features/profile/components/ProfileValidationSchema';
import type { FormDataExperience } from '@/features/profile/types';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import { InputField } from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Modal from '@/stories/Common/Modal';
import Select from '@/stories/Common/Select';

const AddExperienceModal = (props: {
  experience_id?: string;
  isOpenModal: boolean;
  onClose: () => void;
}) => {
  // ** Hooks **
  const params = useParams();

  // ** Props **
  const { experience_id, isOpenModal, onClose } = props;

  // ** Hook Form **
  const formResolver: Resolver<FormDataExperience> = yupResolver(experienceSchema);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
    getValues,
    setValue,
    clearErrors,
    control,
    watch,
  } = useForm<FormDataExperience>({
    resolver: formResolver,
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      designation: '',
      organization: '',
      currentlyWorking: false,
      location: '',
      specialty: '',
      start_month: null,
      start_year: null,
      end_month: null,
      end_year: null,
    },
  });

  // ** Vars **
  const { therapist_id } = params;

  // *** Services ***
  const {
    data: experienceData,
    isPending: isGetTherapistExperienceApiPending,
    dataUpdatedAt: experienceDataUpdateAt,
  } = useGetTherapistExperience({
    therapist_id,
    experience_id: experience_id || '',
    options: {
      enabled: !!experience_id,
      refetchOnMount: true,
      cacheTime: 0,
      staleTime: 0,
    },
  });
  const {
    mutateAsync: createTherapistExperienceApi,
    isPending: isCreateTherapistExperienceApiPending,
    error: createTherapistExperienceError,
  } = useCreateTherapistExperience({ therapist_id });

  const {
    mutateAsync: updateTherapistExperienceApi,
    isPending: isUpdateTherapistExperienceApiPending,
    error: updateTherapistExperienceError,
  } = useUpdateTherapistExperience({ experience_id, therapist_id });

  const setMonthOption = (monthVal: number) => {
    return MONTHS.find(item => item.value === monthVal) ?? null;
  };

  const setYearOption = (yearVal: number) => {
    return YEARS.find(item => item.value === yearVal) ?? null;
  };

  // *** Helpers ***
  const createOrUpdateTherapistExperience = async () => {
    const vals = getValues();
    const {
      designation,
      organization,
      location,
      start_year,
      start_month,
      end_year,
      end_month,
      specialty,
    } = vals;

    const bodyData = {
      designation,
      organization,
      location,
      start_year: start_year?.value,
      start_month: start_month?.value,
      end_year: end_year?.value,
      end_month: end_month?.value,
      specialty,
    };
    if (experience_id) {
      await updateTherapistExperienceApi(bodyData);
      if (!updateTherapistExperienceError) {
        onClose();
      }
    } else {
      await createTherapistExperienceApi(bodyData);
      if (!createTherapistExperienceError) {
        onClose();
      }
    }
  };

  const setExperienceData = async () => {
    const {
      designation,
      location,
      end_year,
      end_month,
      start_month,
      start_year,
      organization,
      specialty,
    } = experienceData;

    reset({
      designation,
      organization,
      location,
      end_year: setYearOption(end_year),
      end_month: setMonthOption(end_month),
      start_month: setMonthOption(start_month),
      start_year: setYearOption(start_year),
      currentlyWorking: _.isNil(end_month) ? true : false,
      specialty,
    });
  };

  // *** Effects ***
  useEffect(() => {
    if (experienceData) {
      setExperienceData();
    }
  }, [experienceDataUpdateAt]);

  const handleCurrentlyWorkingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked) {
      setValue('end_month', null, { shouldValidate: true });
      setValue('end_year', null, { shouldValidate: true });
      clearErrors(['end_year', 'end_month']);
    }
  };

  return (
    <>
      {isGetTherapistExperienceApiPending && experience_id ? (
        <Spinner />
      ) : (
        // updated modal
        <Modal
          title={`${experience_id ? 'Edit' : 'Add'} Experience`}
          size='lg'
          isOpen={Boolean(isOpenModal)}
          onClose={onClose}
          closeButton
          id='Add-Experience-modal'
          footerClassName='pt-30px flex justify-end border border-solid border-surface'
          footer={
            <>
              <Button
                variant='filled'
                title='Save'
                className='rounded-10px min-h-50px !px-10'
                onClick={handleSubmit(createOrUpdateTherapistExperience)}
                isLoading={
                  isCreateTherapistExperienceApiPending || isUpdateTherapistExperienceApiPending
                }
                isDisabled={!isDirty || _.isEmpty(dirtyFields)}
              />
            </>
          }
        >
          <div className='flex flex-col gap-5'>
            <InputField
              name='designation'
              register={register}
              type='text'
              label='Designation'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              placeholder='Enter Designation'
              error={errors.designation?.message || ''}
            />
            <InputField
              name='organization'
              register={register}
              type='text'
              label='Hospital Name'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              placeholder='Enter Hospital name'
              error={errors.organization?.message}
            />
            <InputField
              name='location'
              register={register}
              type='text'
              label='Location'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              placeholder='Enter location'
              error={errors.location?.message || ''}
            />
            <CheckboxField
              id='profile-checkbox-currentlyWorking'
              label={'I Currently Work Here'}
              labelClass='w-full !text-base !leading-5'
              labelPlacement={'end'}
              name={'currentlyWorking'}
              onChange={handleCurrentlyWorkingChange}
              register={register}
              isDisabled={!!watch('end_month') || !!watch('end_year')}
            />

            <div className='flex flex-col gap-1.5'>
              <label className='text-blackdark text-base font-normal block leading-5'>
                Start Date
              </label>
              <div className='grid grid-cols-2 gap-5 '>
                <Select
                  control={control}
                  name='start_month'
                  options={MONTHS}
                  placeholder='Select start Month'
                  error={
                    errors.start_month && (errors.start_month?.message as FieldErrors<FormData>)
                  }
                  portalRootId='Add-Experience-modal'
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
                  control={control}
                  name='start_year'
                  options={YEARS}
                  placeholder='Select start year'
                  error={errors.start_year && (errors.start_year?.message as FieldErrors<FormData>)}
                  portalRootId='Add-Experience-modal'
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
            </div>
            <div className='flex flex-col gap-1.5'>
              <label className='text-blackdark text-base font-normal mb-1.5 block leading-5'>
                End Date
              </label>
              <div className='grid grid-cols-2 gap-5'>
                <Select
                  control={control}
                  options={MONTHS}
                  name='end_month'
                  placeholder='Select end Month'
                  isClearable={true}
                  error={errors.end_month && (errors.end_month?.message as FieldErrors<FormData>)}
                  isDisabled={watch('currentlyWorking')}
                  portalRootId='Add-Experience-modal'
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
                  control={control}
                  name='end_year'
                  options={YEARS}
                  placeholder='Select end year'
                  error={errors.end_year && (errors.end_year?.message as FieldErrors<FormData>)}
                  isDisabled={watch('currentlyWorking')}
                  portalRootId='Add-Experience-modal'
                  isClearable={true}
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
            </div>

            <InputField
              name='specialty'
              register={register}
              type='text'
              label='Specialty'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              placeholder='Enter Specialty'
              error={errors.specialty?.message || ''}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default AddExperienceModal;
