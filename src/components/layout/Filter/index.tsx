import { useEffect, useMemo, useRef } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import _ from 'lodash';
import moment from 'moment';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form';

import { getFilterValidationSchema } from '@/components/layout/Filter/validation-schema';
import { FIELD_TYPE } from '@/constants/CommonConstant';
import type { OptionType } from '@/features/calendar/types';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import { NumberField } from '@/stories/Common/NumberField';
import Select, { CustomAsyncSelect } from '@/stories/Common/Select';

export type CommonFilterField<T extends FieldValues> =
  | {
      type: typeof FIELD_TYPE.DATE_RANGE;
      name: Path<T>;
      label: string;
      maxDate?: Date;
    }
  | {
      type: typeof FIELD_TYPE.SELECT;
      name: Path<T>;
      label: string;
      options: OptionType[];
      isMulti?: boolean;
      placeholder?: string;
    }
  | {
      type: typeof FIELD_TYPE.TEXT;
      name: Path<T>;
      label: string;
      placeholder?: string;
    }
  | {
      type: typeof FIELD_TYPE.NUMBER;
      name: Path<T>;
      label: string;
      placeholder?: string;
    }
  | {
      type: typeof FIELD_TYPE.ASYNC_SELECT;
      name: Path<T>;
      label: string;
      queryKey: string;
      queryFn: () => Promise<{ data: OptionType[]; hasMore: boolean }>;
      isMulti?: boolean;
      showImage?: boolean;
    }
  | {
      type: typeof FIELD_TYPE.NUMBER_RANGE;
      name: Path<T>;
      label: string;
    }
  | {
      type: typeof FIELD_TYPE.REQUEST_TYPE;
      name: Path<T>;
      label: string;
      options: OptionType[];
      isMulti?: boolean;
    }
  | {
      type: typeof FIELD_TYPE.ASSIGNEE;
      name: Path<T>;
      label: string;
      options: OptionType[];
      isMulti?: boolean;
    };

interface CommonFilterProps<T extends FieldValues> {
  fields: CommonFilterField<T>[];
  timezone?: string;
  isLoading?: boolean;
  onApply: (filters: T) => void;
  onClear?: () => void;
  defaultValues: DefaultValues<T>;
  onClose?: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const getLoadingMessages = (label: string) => {
  let plural: string;

  if (label.endsWith('y')) {
    plural = `${label.slice(0, -1)}ies`;
  } else {
    plural = `${label.endsWith('s') ? label : label}s`;
  }
  plural = plural.toLocaleLowerCase();

  return {
    loadingMessage: `Loading ${plural}...`,
    loadingMoreMessage: `Loading more ${plural}...`,
  };
};

const CommonFilter = <T extends FieldValues>({
  fields,
  timezone,
  isLoading = false,
  onApply,
  onClear,
  defaultValues,
  onClose,
  buttonRef,
}: CommonFilterProps<T>) => {
  // ** Validation Schema **
  const filterSchema = useMemo(() => {
    const schema = getFilterValidationSchema(fields);
    return schema;
  }, [fields]);

  const {
    setValue,
    getValues,
    reset,
    clearErrors,
    formState: { errors },
    handleSubmit,
  } = useForm<T>({
    mode: 'onChange',
    defaultValues: defaultValues,
    resolver: yupResolver(filterSchema),
  });
  const values = getValues();

  const ref = useRef<HTMLDivElement>(null);

  const handleApply = handleSubmit(() => {
    onApply(getValues());
  });

  const handleClear = () => {
    reset();
    onClear?.();
  };

  const setFormValue = (name: Path<T>, value: unknown) => {
    setValue(name, value as PathValue<T, typeof name>, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors(name);
  };

  useEffect(() => {
    const safeSelectors = [
      '.react-datepicker',
      '.css-tj5bde-Svg',
      '.css-15lsz6c-indicatorContainer',
      '.css-1xc3v61-indicatorContainer',
    ];

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (ref.current?.contains(target)) return;
      if (buttonRef?.current?.contains(target)) return;

      if (safeSelectors.some(sel => target.closest(sel))) return;

      onClose?.();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, buttonRef]);

  return (
    <div
      ref={ref}
      className='absolute md:right-0 left-0 md:left-auto z-10 mt-2 sm:min-w-438px min-w-260px bg-white rounded-20px sm:p-5 px-3 py-5 border border-solid border-surface shadow-dropdown'
    >
      <div className='flex flex-col gap-5'>
        {fields.map(field => {
          switch (field.type) {
            case FIELD_TYPE.DATE_RANGE:
              return (
                <CustomDatePicker
                  key={field.name}
                  label={field.label}
                  onChange={(update: [Date | null, Date | null]) => {
                    const [start, end] = update;
                    setFormValue(field.name, {
                      startDate: start ? moment(start, timezone).format('YYYY-MM-DD') : null,
                      endDate: end ? moment(end, timezone).format('YYYY-MM-DD') : null,
                    });
                  }}
                  isClearable
                  parentClassName='!z-0'
                  className='!p-3'
                  selectsRange
                  startDate={
                    values?.[field.name]?.startDate ? new Date(values[field.name].startDate) : null
                  }
                  endDate={
                    values?.[field.name]?.endDate ? new Date(values[field.name].endDate) : null
                  }
                  placeholderText='Select Date Range'
                  error={errors[field.name]?.message}
                  {...(field.maxDate && { maxDate: field.maxDate })}
                />
              );

            case FIELD_TYPE.SELECT:
              return (
                <Select
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  options={field.options}
                  isMulti={field.isMulti}
                  onChange={selected => {
                    setFormValue(field.name, selected);
                  }}
                  placeholder={
                    _.isString(field.placeholder) ? field.placeholder : `Select ${field.label}`
                  }
                  labelClassName='!text-base'
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
                  isClearable
                  value={values[field.name]}
                />
              );

            case FIELD_TYPE.TEXT:
              return (
                <InputField
                  key={field.name}
                  type='text'
                  label={field.label}
                  placeholder={field.placeholder}
                  value={getValues(field.name) || ''}
                  onChange={e => setFormValue(field.name, e.target.value)}
                  inputClass='!text-base !leading-5'
                />
              );

            case FIELD_TYPE.NUMBER:
              return (
                <InputField
                  key={field.name}
                  type='number'
                  label={field.label}
                  placeholder={field.placeholder}
                  value={getValues(field.name) || ''}
                  onChange={e => setFormValue(field.name, e.target.value)}
                  inputClass='!text-base !leading-5'
                />
              );

            case FIELD_TYPE.ASYNC_SELECT: {
              const { loadingMessage, loadingMoreMessage } = getLoadingMessages(field.label);
              return (
                <CustomAsyncSelect
                  queryKey={field.queryKey}
                  label={field.label}
                  isClearable
                  labelClassName='!text-base'
                  loadOptions={field.queryFn}
                  onChange={selected => {
                    setFormValue(field.name, selected);
                  }}
                  loadingMessage={loadingMessage}
                  loadingMoreMessage={loadingMoreMessage}
                  placeholder={`Select ${field.label}`}
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
                  isMulti={field.isMulti}
                  name={field.name}
                  value={values[field.name]}
                  key={field.name}
                  {...(field.showImage && {
                    formatOptionLabel: (data: OptionType) => {
                      const splittedValue = _.isString(data.label) ? data?.label?.split(' ') : [];
                      const fname = splittedValue[0];
                      const lname = splittedValue[1];
                      return (
                        <div className='flex items-center gap-2.5 p-1.5'>
                          <Image
                            imgPath={data.image ? SERVER_URL + data.image : ''}
                            firstName={fname}
                            lastName={lname}
                            alt='User Avatar'
                            className='w-10 h-10 rounded-full bg-Gray border border-solid border-white'
                            imageClassName='w-full h-full object-cover object-center rounded-full'
                            initialClassName='sm:!text-base'
                          />
                          <p className={`text-base truncate font-semibold`}>{data.label}</p>
                        </div>
                      );
                    },
                  })}
                />
              );
            }

            case FIELD_TYPE.NUMBER_RANGE:
              return (
                <div key={field.name} className='flex flex-col gap-2'>
                  <span className='text-blackdark text-base font-normal mb-1.5 block leading-5'>
                    {field.label}
                  </span>
                  <div className='flex items-center gap-2'>
                    <NumberField
                      key={`${field.name}_min`}
                      min={0}
                      placeholder='Enter Min'
                      value={values[field.name]?.min ?? ''}
                      onChange={e => {
                        const minVal =
                          e.target.value === '' || +e.target.value < 0
                            ? null
                            : Number(e.target.value);
                        setFormValue(field.name, {
                          ...values[field.name],
                          min: minVal,
                        });
                      }}
                      inputClass='!text-base !leading-5'
                    />
                    <span className='text-blackdark text-base font-normal mb-1.5 block leading-22px'>
                      to
                    </span>
                    <NumberField
                      key={`${field.name}_max`}
                      placeholder='Enter Max'
                      min={values[field.name]?.min + 1 || 0}
                      value={values[field.name]?.max ?? ''}
                      onChange={e => {
                        const maxVal = e.target.value === '' ? null : Number(e.target.value);
                        setFormValue(field.name, {
                          ...values[field.name],
                          max: maxVal,
                        });
                      }}
                      inputClass='!text-base !leading-5'
                    />
                  </div>
                  <p className='text-red-500 text-xs mt-1'>{errors?.[field?.name]?.message}</p>
                </div>
              );
            default:
              return null;
          }
        })}

        {/* Buttons */}
        <div className='flex flex-wrap sm:flex-nowrap justify-center items-center gap-4'>
          <Button
            variant='outline'
            title='Clear Filters'
            parentClassName='sm:w-2/4'
            className='rounded-10px w-full min-h-50px'
            onClick={handleClear}
            type='button'
          />
          <Button
            variant='filled'
            title='Apply Filter'
            parentClassName='sm:w-2/4'
            className='rounded-10px w-full min-h-50px'
            onClick={handleApply}
            type='button'
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default CommonFilter;
