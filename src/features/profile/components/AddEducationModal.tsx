import { useEffect, type Dispatch, type SetStateAction } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
import { Controller, FormProvider, type Resolver, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { getFieldOptionsAsyncByTherapistId } from '@/api/field-option';
import {
  useCreateTherapistEducation,
  useGetTherapistEducation,
  useUpdateTherapistEducation,
} from '@/api/therapist-education';
import { FieldOptionType } from '@/enums';
import type { OptionType } from '@/features/calendar/types';
import type { EducationOpenModalStateType, FormDataEducation } from '@/features/profile/types';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Modal from '@/stories/Common/Modal';
import { CustomAsyncSelect } from '@/stories/Common/Select';

import AddEducationDegreeModal from './AddEducationDegreeModal';
import { EducationSchema } from './ProfileValidationSchema';

const ADD_DEGREE_OPTION = {
  label: 'Add New Degree',
  value: 'CREATE',
};

const today = new Date();
const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
const maxDate = new Date(today.getFullYear() + 100, today.getMonth(), today.getDate());
const AddEducationModal = (props: {
  education_id?: string;
  isOpenModal: boolean;
  onClose: () => void;
  setOpenModal: Dispatch<SetStateAction<EducationOpenModalStateType>>;
  openModal: EducationOpenModalStateType;
}) => {
  // ** Hooks **
  const params = useParams();

  // ** Props **
  const { education_id, isOpenModal, onClose, openModal, setOpenModal } = props;

  // ** Hook Form **
  const formResolver: Resolver<FormDataEducation> = yupResolver(EducationSchema);

  const formMethods = useForm<FormDataEducation>({
    resolver: formResolver,
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      degree: null,
      end_date: null,
      start_date: null,
      gpa: null,
      institution: null,
      specialization: null,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
    getValues,
    control,
  } = formMethods;

  // ** Vars **
  const { therapist_id } = params;

  // *** Services ***
  const {
    data: educationData,
    isPending: isGetEducationPending,
    dataUpdatedAt: experienceDataUpdateAt,
  } = useGetTherapistEducation({
    therapist_id,
    education_id: education_id || '',
    options: {
      enabled: !!education_id,
      refetchOnMount: true,
      cacheTime: 0,
      staleTime: 0,
    },
  });
  const { mutateAsync: createAPI, isPending: isCreatePending } = useCreateTherapistEducation({
    therapist_id,
  });

  const { mutateAsync: updateAPI, isPending: isUpdatePending } = useUpdateTherapistEducation({
    education_id,
    therapist_id,
  });

  // *** Helpers ***
  const onSubmit = async vals => {
    const { degree, end_date, gpa, institution, specialization, start_date } = vals;

    const bodyData = {
      degree: degree?.value,
      end_date,
      gpa,
      institution,
      specialization,
      start_date,
    };

    if (education_id) {
      await updateAPI(bodyData, {
        onSuccess() {
          onClose();
        },
      });
      onClose();
    } else {
      await createAPI(bodyData, {
        onSuccess() {
          onClose();
        },
      });
    }
  };

  const setEducationData = async () => {
    const { institution, degree, specialization, gpa, start_date, end_date } = educationData;

    reset({
      institution,
      degree,
      specialization,
      gpa,
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null,
    });
  };

  // *** Effects ***
  useEffect(() => {
    if (educationData) {
      setEducationData();
    }
  }, [experienceDataUpdateAt]);

  return (
    <>
      {isGetEducationPending && education_id ? (
        <Spinner />
      ) : (
        <Modal
          title={`${education_id ? 'Edit' : 'Add'} Education`}
          size='lg'
          isOpen={Boolean(isOpenModal)}
          onClose={onClose}
          closeButton
          id='Add-Education-modal'
          contentClassName='pt-30px'
          footerClassName='flex justify-end border-t border-solid border-surface pt-30px'
          footer={
            <Button
              variant='filled'
              title='Save'
              className='rounded-10px !px-8'
              type='button'
              onClick={handleSubmit(onSubmit)}
              isLoading={isCreatePending || isUpdatePending}
              isDisabled={!isDirty || _.isEmpty(dirtyFields)}
            />
          }
        >
          <div className='flex flex-col gap-5'>
            <InputField
              name='institution'
              register={register}
              type='text'
              label='Institution'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              placeholder='Enter Institution'
              error={errors.institution?.message || ''}
              isRequired
            />
            <Controller
              name='degree'
              control={control}
              render={({ field }) => (
                <CustomAsyncSelect
                  label='Degree'
                  labelClassName='!text-base'
                  loadOptions={(page, searchTerm) => {
                    return getFieldOptionsAsyncByTherapistId(
                      FieldOptionType.DEGREE,
                      page,
                      searchTerm
                    );
                  }}
                  AddOption={ADD_DEGREE_OPTION}
                  queryKey={'degree-options'}
                  pageSize={10}
                  name={field.name}
                  placeholder='Select Degree'
                  error={errors.degree?.message}
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
                    menu: () => ({
                      zIndex: '99',
                    }),
                  }}
                  formatOptionLabel={(data: OptionType) => (
                    <div
                      className='flex items-center gap-2.5 p-1.5'
                      onClick={() =>
                        data.value === ADD_DEGREE_OPTION.value
                          ? setOpenModal(p => ({ ...p, addDegree: true }))
                          : null
                      }
                    >
                      {data.value === 'CREATE' && (
                        <div className='bg-Gray rounded-full'>
                          <Icon name='plus' />
                        </div>
                      )}
                      <p className='text-base truncate font-semibold'>{data.label}</p>
                    </div>
                  )}
                  value={(() => {
                    const val = getValues('degree');
                    return val &&
                      typeof val === 'object' &&
                      'value' in val &&
                      val.value === ADD_DEGREE_OPTION.value
                      ? null
                      : val;
                  })()}
                  onChange={selected => {
                    if (selected?.value === ADD_DEGREE_OPTION.value) {
                      field.onChange(null);
                      setOpenModal(p => ({ ...p, addDegree: true }));
                    } else {
                      field.onChange(selected);
                    }
                  }}
                  isClearable
                />
              )}
            />
            <InputField
              name='specialization'
              register={register}
              type='text'
              label='Major/Specialization'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              placeholder='Enter specialization'
              error={errors.specialization?.message || ''}
            />
            <InputField
              name='gpa'
              register={register}
              type='text'
              label='GPA'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              placeholder='Enter GPA'
              error={errors.gpa?.message}
            />
            <Controller
              name='start_date'
              control={control}
              render={({ field, fieldState }) => (
                <CustomDatePicker
                  label='Start Date'
                  selected={field.value}
                  onChange={date => field.onChange(date ? new Date(date) : null)}
                  placeholderText='Select Date'
                  error={fieldState.error?.message}
                  className='!py-3'
                  isClearable
                  minDate={minDate}
                  maxDate={maxDate}
                />
              )}
            />
            <Controller
              name='end_date'
              control={control}
              render={({ field, fieldState }) => (
                <CustomDatePicker
                  label='End Date'
                  selected={field.value}
                  onChange={date => field.onChange(date ? new Date(date) : null)}
                  placeholderText='Select Date'
                  error={fieldState.error?.message}
                  className='!py-3'
                  isClearable
                  minDate={minDate}
                  maxDate={maxDate}
                />
              )}
            />
          </div>
        </Modal>
      )}

      {openModal.addDegree && (
        <FormProvider {...formMethods}>
          <AddEducationDegreeModal
            onClose={() =>
              setOpenModal(prev => ({
                ...prev,
                addDegree: false,
              }))
            }
            isOpen={openModal.addDegree}
          />
        </FormProvider>
      )}
    </>
  );
};

export default AddEducationModal;
