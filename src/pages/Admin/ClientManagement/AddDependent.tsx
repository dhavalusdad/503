import React, { useMemo, useState } from 'react';

import _ from 'lodash';
import { useFormContext, useFieldArray, useWatch, Controller } from 'react-hook-form';

import { GENDER_OPTION } from '@/constants/CommonConstant';
import { RelationEnum } from '@/enums';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import PhoneField from '@/stories/Common/PhoneNumberInput';
import Select from '@/stories/Common/Select';

type FormFieldType = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
};

type DependentItem = FormFieldType & {
  id?: string | number;
  relationship: RelationEnum;
  isNew?: boolean;
  is_active?: boolean;
  user_id?: string | number;
  backendId?: string | number;
};

type AddDependentFormType = {
  dependents: DependentItem[];
};

interface AddDependentProps {
  isEdit?: boolean;
  onDeleteDependent?: (dependentId: string | number) => Promise<void>;
  isDeletingDependent?: boolean;
}

const AddDependent = ({ isEdit, onDeleteDependent, isDeletingDependent }: AddDependentProps) => {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useFormContext<AddDependentFormType>();

  const watchData = useWatch({ control });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dependents',
  });

  const [fieldErrorMessage, setFieldErrorMessage] = useState<{
    [RelationEnum.MINOR]?: string;
    [RelationEnum.COUPLE]?: string;
    [RelationEnum.FAMILY]?: string;
  }>({});

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    dependentId?: string | number;
    index?: number;
    type?: RelationEnum;
  }>({
    isOpen: false,
  });

  const grouped = useMemo(() => {
    const latestData = fields || [];
    return {
      [RelationEnum.MINOR]: latestData.filter(f => f.relationship === RelationEnum.MINOR),
      [RelationEnum.COUPLE]: latestData.filter(f => f.relationship === RelationEnum.COUPLE),
      [RelationEnum.FAMILY]: latestData.filter(f => f.relationship === RelationEnum.FAMILY),
    };
  }, [fields]);

  const isValidField = async () => {
    let isValid = true;
    const fieldData = watchData.dependents || [];
    if (!fieldData.length) return true;

    const fieldValue = _.cloneDeep(fieldData);
    const lastElementOfArray = _.cloneDeep(fieldValue)?.pop() || {};

    const clonedLastElement = _.cloneDeep(lastElementOfArray);
    delete clonedLastElement['relationship'];
    const filledValues = Object.values(clonedLastElement).filter(Boolean);
    const errorMessage = [];

    if (!filledValues.length) {
      isValid = false;
      errorMessage.push({
        type: lastElementOfArray.relationship,
        message: 'Fill above field values first!',
      });
    }

    if (errorMessage.length) {
      errorMessage.forEach(thisError => {
        const dependentType = thisError.type as string;
        setFieldErrorMessage(prev => ({
          ...prev,
          [dependentType]: thisError.message,
        }));
        setTimeout(() => {
          setFieldErrorMessage(prev => ({
            ...prev,
            [dependentType]: '',
          }));
        }, 3000);
      });
    } else if (isValid) {
      const isValidated = await trigger('dependents');
      if (!isValidated) {
        isValid = false;
      }
    }
    return isValid;
  };

  const appendForm = async (type: RelationEnum) => {
    const isValidData = await isValidField(type);
    if (isValidData) {
      append({
        relationship: type,
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        isNew: true,
      });
    }
  };

  const handleRemoveClick = (type: RelationEnum, field: DependentItem & { id: string }) => {
    const globalIndex = fields.findIndex(f => f.id === field.id);

    if (field.isNew) {
      remove(globalIndex);
    } else {
      setDeleteModal({
        isOpen: true,
        dependentId: field.user_id,
        index: globalIndex,
        type,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.dependentId || deleteModal.index === undefined) return;

    try {
      if (onDeleteDependent) {
        await onDeleteDependent(deleteModal.dependentId);
      }

      remove(deleteModal.index);

      setDeleteModal({ isOpen: false });
    } catch (error) {
      console.error('Error deleting dependent:', error);
    }
  };

  const renderFields = (field: DependentItem & { id: string }, type: RelationEnum) => {
    const globalIndex = fields.findIndex(f => f.id === field.id);
    const prefix = `dependents.${globalIndex}` as const;
    const key = `${type}_${field.backendId || globalIndex}`;

    return (
      <div key={key} className='relative'>
        <div className='w-full p-5 rounded-20px bg-Gray grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
          <InputField
            key={`${key}_first_name`}
            type='text'
            label='First Name'
            labelClass='!text-base'
            register={register}
            error={errors?.dependents?.[globalIndex]?.first_name?.message}
            isRequired
            placeholder='Enter First Name'
            name={`${prefix}.first_name`}
            parentClassName=''
            inputClass={'!text-base !leading-5 bg-white'}
          />

          <InputField
            key={`${key}_last_name`}
            type='text'
            label='Last Name'
            labelClass='!text-base'
            register={register}
            name={`${prefix}.last_name`}
            error={errors?.dependents?.[globalIndex]?.last_name?.message}
            parentClassName=''
            placeholder='Enter Last Name'
            inputClass={'!text-base !leading-5 bg-white'}
            isRequired
          />

          <Controller
            name={`${prefix}.dob`}
            control={control}
            rules={{
              required: true,
            }}
            render={({ field, fieldState }) => {
              return (
                <CustomDatePicker
                  label='Date of Birth'
                  labelClass='!text-base'
                  placeholderText='Select date of birth'
                  error={fieldState.error?.message}
                  selected={field.value}
                  onChange={date => field.onChange(date ? new Date(date) : null)}
                  maxDate={new Date()}
                  maxAge={130}
                  isRequired
                  key={`${key}_dob`}
                  parentClassName='z-[0]'
                  className='client-profile !text-base !leading-5 bg-white !py-3.5'
                  name={`${prefix}.dob`}
                />
              );
            }}
          />

          <PhoneField
            key={`${key}_phone`}
            label={type == RelationEnum.MINOR ? 'Emergency Contact' : 'Contact Number'}
            labelClass='!text-base'
            value={getValues(`${prefix}.phone`) || ''}
            name='phone'
            onChange={val => setValue(`${prefix}.phone`, val, { shouldValidate: true })}
            error={errors?.dependents?.[globalIndex]?.phone?.message}
            placeholder='Contact number'
            parentClassName='client-profile'
            inputClass={` !text-base !leading-5 !bg-white ${errors?.dependents?.[globalIndex]?.phone && errors?.dependents?.[globalIndex]?.phone.message ? 'border-red-500' : ''} `}
            buttonClass='!bg-white'
            isRequired
          />

          <InputField
            key={`${key}_email`}
            type='email'
            label='Email'
            labelClass='!text-base'
            register={register}
            name={`${prefix}.email`}
            error={errors?.dependents?.[globalIndex]?.email?.message}
            parentClassName=''
            placeholder='Email'
            inputClass={'!text-base !leading-5 bg-white'}
            isRequired
            isDisabled={isEdit && !field.isNew}
          />

          <Select
            label='Gender'
            options={GENDER_OPTION}
            control={control}
            name={`${prefix}.gender`}
            placeholder='Select gender'
            error={errors?.dependents?.[globalIndex]?.gender?.message}
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
                background: '#ffffff',
                backgroundColor: '#fff',
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
            labelClassName='!text-base'
            isRequired
          />
        </div>
        <div className='absolute -right-2.5 -top-2.5'>
          <Button
            type='button'
            variant='outline'
            title=''
            onClick={() => handleRemoveClick(type as RelationEnum, field)}
            className='!p-2 rounded-full !border-red !text-red hover:!bg-red/15'
            icon={<Icon name='delete' className='icon-wrapper w-4 h-4 text-red' />}
            isIconFirst
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className='relative'>
        <div className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
          {[RelationEnum.MINOR, RelationEnum.COUPLE, RelationEnum.FAMILY].map(formType => (
            <div
              key={formType}
              className='flex items-center justify-between gap-3 border border-solid border-surface py-2.5 px-3.5 rounded-10px'
            >
              <h6 className='text-base font-semibold text-blackdark leading-22px capitalize'>
                {formType}
              </h6>
              <Button
                type='button'
                variant='filled'
                title='Add New Form'
                icon={<Icon name='plus' className='icon-wrapper w-5 h-5' />}
                isIconFirst
                className='rounded-lg !px-2.5 !py-2'
                onClick={() => appendForm(formType)}
              />
            </div>
          ))}
        </div>
        <div className='flex flex-col'>
          {Object.entries(grouped).map(([type, arr]) => (
            <React.Fragment key={type}>
              {arr.length > 0 && (
                <>
                  <div className='bg-surface w-full h-1px my-30px'></div>
                  <h2 className='font-bold text-lg text-blackdark leading-6 capitalize mb-3'>
                    {type}
                  </h2>
                  <div className='flex flex-col gap-5'>
                    {arr.map((field, idx) => (
                      <React.Fragment key={`${type}_${idx}`}>
                        {renderFields(field, type as RelationEnum)}
                      </React.Fragment>
                    ))}
                  </div>
                  {fieldErrorMessage[type as RelationEnum] && (
                    <p className='text-xs text-red mt-1.5'>
                      {fieldErrorMessage[type as RelationEnum]}
                    </p>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <AlertModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false })}
          onSubmit={handleConfirmDelete}
          alertMessage='Are you sure you want to delete this dependent? This action cannot be undone.'
          title='Confirm Delete'
          isSubmitLoading={isDeletingDependent}
        />
      )}
    </>
  );
};

export default AddDependent;
