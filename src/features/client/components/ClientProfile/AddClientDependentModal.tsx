import React, { useEffect, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import moment from 'moment';
import { useForm } from 'react-hook-form';
// import { useSelector } from 'react-redux';

import { getTherapyTypesAsync } from '@/api/field-option';
import {
  GENDER_OPTION,
  generateHexId,
  RELATIONSHIP_OPTIONS,
  THERAPY_TYPE_OPTIONS,
} from '@/constants/CommonConstant';
import type { RelationEnum, TherapyType } from '@/enums';
import type { FilterState } from '@/features/appointment';
// import { currentUser } from '@/redux/ducks/user';
import type { DependentFormValues, MultipleDependentFormValue } from '@/features/client/types';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';
import SelectButtonGroup from '@/stories/Common/SelectButtonGroup';

import { dependentValidationModalSchema } from '../../validationSchema/dependentValidation';

interface ClientDependentFormProps {
  relationship?: RelationEnum;
  mode?: 'create' | 'view' | 'edit';
  selectedDependentId?: string | null;
  setDependentData: (DependentFormValues: DependentFormValues[]) => void;
  onSubmit: () => void;
  filter?: FilterState;
  dependentData: DependentFormValues[];
}

export const AddClientDependentModal = ({
  relationship,
  mode,
  selectedDependentId,
  setDependentData,
  onSubmit,
  filter,
  dependentData,
}: ClientDependentFormProps) => {
  // const { timezone } = useSelector(currentUser);

  const initialFormValues: DependentFormValues = {
    relationship: relationship ? relationship : undefined,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id: generateHexId(),
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    unregister,
    formState: { errors },
  } = useForm<MultipleDependentFormValue>({
    resolver: yupResolver(dependentValidationModalSchema),
    mode: 'all',
  });

  const [selectedRelation, setSelectedRelation] = useState<string>('');
  const [relationOption, setRelationOptions] = useState(RELATIONSHIP_OPTIONS);
  // const [age, setAge] = useState<string>('');

  useEffect(() => {
    if (relationship) {
      setValue('relationship', relationship);
    }
  }, [relationship]);

  useEffect(() => {
    if ((mode === 'view' || mode === 'edit') && dependentData.length > 0) {
      reset({
        dependents: dependentData,
      });
    }
  }, [mode, dependentData, selectedDependentId]);

  useEffect(() => {
    getTherapyTypesAsync().then(res => {
      if (res.data) {
        const response = res.data.find(data => data.value === filter?.therapyType?.value);
        const label: TherapyType = response.label;
        setRelationOptions([
          {
            value: THERAPY_TYPE_OPTIONS[label],
            label: THERAPY_TYPE_OPTIONS[label],
          },
        ]);
        setSelectedRelation(THERAPY_TYPE_OPTIONS[label]);
      }
    });
  }, []);

  const createOrUpdateUserDependent = async (data: MultipleDependentFormValue) => {
    const payload: DependentFormValues[] = data.dependents.map(dependent => ({
      ...dependent,
      relationship: selectedRelation as RelationEnum,
    }));

    const updated: DependentFormValues[] = [...dependentData];

    payload.forEach(dep => {
      const existingIndex = updated.findIndex(d => d.id === dep.id);
      if (existingIndex > -1) {
        updated[existingIndex] = dep;
      } else {
        updated.push(dep);
      }
    });

    setDependentData(updated);

    onSubmit();
  };

  const handleAddNewDependent = () => {
    const payload: DependentFormValues = {
      ...initialFormValues,
      id: generateHexId(),
    };
    setDependentData([...dependentData, payload]);
  };

  const removeDependent = (id: string) => {
    const index = dependentData.findIndex(d => d.id === id);

    if (index === -1) return;

    unregister(`dependents.${index}`);
    setDependentData(dependentData.filter((dependent: DependentFormValues) => dependent.id !== id));
  };

  useEffect(() => {
    if (mode === 'create') {
      handleAddNewDependent();
      if (dependentData.length > 0) {
        reset({
          dependents: dependentData,
        });
      }
    }
  }, []);

  const isReadOnly = mode === 'view';

  return (
    <>
      <div className='flex flex-col gap-5'>
        <SelectButtonGroup
          options={relationOption}
          onChange={setSelectedRelation}
          value={selectedRelation}
          disabled={true}
        />
        <div className='flex flex-col gap-5'>
          {dependentData.map((dependent: DependentFormValues, index: number) => (
            <React.Fragment key={dependent.id}>
              {index > 0 && (
                <>
                  <div className='w-full h-px bg-surface' />
                  <Button
                    variant='none'
                    parentClassName='text-end'
                    className='rounded-10px rounded-lg !p-0'
                    icon={<Icon name='closeRed' />}
                    type='button'
                    onClick={() => removeDependent(dependent.id)}
                  />
                </>
              )}
              <div className='grid grid-cols-2 gap-y-5 gap-25px'>
                <InputField
                  type='text'
                  label='First Name'
                  labelClass='!text-base !leading-5'
                  error={errors?.dependents?.[index]?.first_name?.message}
                  name={`dependents.${index}.first_name`}
                  register={register}
                  isRequired={true}
                  placeholder='Enter First Name'
                  parentClassName=''
                  inputClass={'!text-base !leading-5'}
                  isDisabled={isReadOnly}
                />

                <InputField
                  type='text'
                  label='Last Name'
                  labelClass='!text-base !leading-5'
                  register={register}
                  error={errors?.dependents?.[index]?.last_name?.message}
                  name={`dependents.${index}.last_name`}
                  isRequired={true}
                  parentClassName=''
                  placeholder='Enter Last Name'
                  inputClass={'!text-base !leading-5'}
                  isDisabled={isReadOnly}
                />

                <CustomDatePicker
                  label='Date of Birth'
                  labelClass='!text-base !leading-5'
                  selected={
                    getValues(`dependents.${index}.dob`) &&
                    moment(getValues(`dependents.${index}.dob`)).isValid()
                      ? moment(getValues(`dependents.${index}.dob`)).toDate()
                      : undefined
                  }
                  onChange={date => {
                    if (!date) return;

                    // set dob
                    setValue(`dependents.${index}.dob`, moment(date), { shouldValidate: true });

                    // calculate age for this dependent
                    // const today = moment.tz(new Date(), timezone);
                    // const birthDate = moment.tz(date, timezone);
                    // const age = today.diff(birthDate, 'years');

                    // setAge(age.toString());
                  }}
                  error={errors?.dependents?.[index]?.dob?.message}
                  maxDate={new Date()}
                  isRequired
                  parentClassName=''
                  className='!py-3'
                  disabled={isReadOnly}
                />

                {/* <InputField
            type='number'
            label='Age'
            labelClass='!text-base !leading-22px'
            name={`dependents.${index}.age`}
            value={age}
            parentClassName='col-span-3'
            placeholder='Age'
            inputClass={'!text-base !leading-22px !text-primarygray !px-3.5 !py-3 '}
            readOnly={true}
          /> */}

                <InputField
                  type='email'
                  label='Email'
                  labelClass='!text-base !leading-5'
                  register={register}
                  error={errors?.dependents?.[index]?.email?.message}
                  name={`dependents.${index}.email`}
                  isRequired={true}
                  parentClassName=''
                  placeholder='Email'
                  inputClass={'!text-base !leading-5'}
                  isDisabled={isReadOnly}
                />

                <Select
                  options={GENDER_OPTION}
                  isRequired
                  label='Gender'
                  labelClassName='!text-base !leading-5'
                  value={GENDER_OPTION.find(
                    option => option.value === getValues(`dependents.${index}.gender`)
                  )}
                  placeholder='Select Gender'
                  onChange={value => {
                    if (value && 'value' in value) {
                      setValue(`dependents.${index}.gender`, value.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                  error={errors?.dependents?.[index]?.gender?.message}
                  parentClassName=''
                  isDisabled={isReadOnly}
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
                    }),
                  }}
                />
                <PhoneField
                  label='Contact Number'
                  labelClass='!text-base !leading-5'
                  value={getValues(`dependents.${index}.phone`) || ''}
                  name={`dependents.${index}.phone`}
                  onChange={formattedValue => {
                    setValue(`dependents.${index}.phone`, formattedValue, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  isRequired
                  error={errors?.dependents?.[index]?.phone?.message}
                  placeholder='Contact number'
                  parentClassName=''
                  inputClass={`!text-base !leading-5 ${
                    errors?.dependents?.[index]?.phone ? 'border-red-500' : ''
                  }`}
                  buttonClass='!'
                  disabled={isReadOnly}
                />
                <InputField
                  type='hidden'
                  {...register(`dependents.${index}.id`)}
                  defaultValue={dependent.id}
                />
              </div>
            </React.Fragment>
          ))}
          <div className='w-full flex items-center'>
            <div className='w-full h-px bg-surface' />
            <Button
              variant='none'
              className=' w-full !p-0 rounded-10px rounded-lg'
              type='button'
              icon={<Icon name='addFilled' className='text-primarylight' />}
              onClick={handleAddNewDependent}
            />
            <div className='w-full h-px bg-surface' />
          </div>
          {!isReadOnly && (
            <Button
              variant='filled'
              title={`${selectedDependentId ? 'Update' : 'Save'} ${selectedRelation} Member`}
              className=' w-full rounded-10px rounded-lg'
              type='button'
              // isDisabled={!isDirty && mode == 'create'}
              onClick={handleSubmit(createOrUpdateUserDependent)}
            />
          )}
        </div>
      </div>
    </>
  );
};
