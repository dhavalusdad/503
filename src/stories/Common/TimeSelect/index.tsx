import { useCallback, useEffect, useRef, useState } from 'react';

import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import { DATE_FORMATS } from '@/helper/dateUtils';
import Icon from '@/stories/Common/Icon';

interface TimeSelectProps<TFieldValues extends FieldValues> {
  label?: string;
  parentClassName?: string;
  placeholder?: string;
  value?: Date | null | string;
  onChange?: (time: string) => void;
  labelClassName?: string;
  className?: string;
  timeIntervals?: number;
  error?: string;
  errorClass?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  name?: Path<TFieldValues>;
  control: Control<TFieldValues>;
  // register?: UseFormRegisterReturn | undefined;
  filterTime?: (time: Date) => boolean;
  isISOString?: boolean;
  injectTimes?: Date[];
  isRequired?: boolean;
  isLoading?: boolean;
  minDate?: Date;
  maxDate?: Date;
  minTime?: Date;
  maxTime?: Date;
  timezone?: string;
  portalId?: string;
}
const parseTimeValue = (timeValue: string | Date | null | undefined) => {
  if (!timeValue) return null;

  if (timeValue instanceof Date) return timeValue;

  const parsedTime = moment(timeValue);
  return parsedTime.isValid() ? parsedTime.toDate() : null;
};

export const TimeSelect = <TFieldValues extends FieldValues>({
  error,
  errorClass,
  label,
  parentClassName,
  placeholder = 'Select time',
  value,
  onChange,
  labelClassName,
  className,
  timeIntervals = 15,
  isDisabled = false,
  name,
  isClearable = false,
  filterTime,
  minDate,
  maxDate,
  minTime,
  isLoading,
  maxTime,
  injectTimes = [],
  isISOString = true,
  isRequired = false,
  control,
  timezone = 'UTC',
  ...restProps
}: TimeSelectProps<TFieldValues>) => {
  const datePickerRef = useRef<DatePicker | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(parseTimeValue(value));
  const [injectedTimes, setInjectedTimes] = useState<Date[]>(injectTimes);

  useEffect(() => {
    if (!startDate || isDisabled) return;
    const minutes = moment(startDate).minutes();
    if (minutes % timeIntervals !== 0) {
      setInjectedTimes(prevTimes => {
        const existingTimes = prevTimes.map(time => moment(time).format('HH:mm'));
        const newTime = moment(startDate).format('HH:mm');
        if (!existingTimes.includes(newTime)) {
          return [...prevTimes, startDate];
        }
        return prevTimes;
      });
    }
  }, [startDate, timeIntervals, isDisabled]);

  const handleIconClick = () => {
    if (!isDisabled && datePickerRef.current) {
      datePickerRef.current.setFocus();
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (isDisabled) return;

    setStartDate(date);

    if (!isISOString) {
      const timeString = moment(date).format(DATE_FORMATS.DEFAULT);
      return onChange?.(timeString);
    }

    if (onChange && isISOString) {
      const timeString = moment(date).toISOString();
      onChange(timeString);
    }
  };

  const toDisplayDate = useCallback(
    (date?: Date | null) => {
      if (!date) return null;
      const m = moment.utc(date).tz(timezone);
      return new Date(
        m.year(),
        m.month(),
        m.date(),
        m.hour(),
        m.minute(),
        m.second(),
        m.millisecond()
      );
    },
    [timezone]
  );

  const toUtcDate = useCallback(
    (date: Date | null) => {
      if (!date) return null;
      const m = moment.tz(
        {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds(),
          millisecond: date.getMilliseconds(),
        },
        timezone
      );
      return m.utc().toDate();
    },
    [timezone]
  );

  return (
    <div className={`w-full ${parentClassName}`}>
      <div className='flex flex-col gap-1.5'>
        {label && (
          <label
            htmlFor='time-picker'
            className={`flex items-center gap-1 text-blackdark text-sm font-normal mb-1.5 leading-5 whitespace-nowrap ${labelClassName}`}
          >
            {label} {isRequired && <span className='text-red-500 font-medium'>*</span>}
          </label>
        )}
        <div className='relative w-full'>
          {name && control ? (
            <Controller
              name={name}
              control={control}
              render={({ field: { onChange: onChangeCallback, value }, fieldState: { error } }) => (
                <DatePicker
                  {...restProps}
                  selected={value ? toDisplayDate(value) : null}
                  {...(minDate && { minDate: toDisplayDate(minDate) })}
                  {...(maxDate && { maxDate: toDisplayDate(maxDate) })}
                  {...(minTime && { minTime: toDisplayDate(minTime) })}
                  {...(maxTime && { maxTime: toDisplayDate(maxTime) })}
                  onChange={val => {
                    onChangeCallback(toUtcDate(val));
                    handleDateChange(toUtcDate(val));
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={timeIntervals}
                  name={name}
                  injectTimes={injectedTimes}
                  timeCaption='Time'
                  isClearable={isClearable}
                  filterTime={filterTime}
                  isLoading={isLoading}
                  showPopperArrow={false}
                  dateFormat='h:mm aa'
                  className={`px-4 pr-8 py-2.5 border border-solid border-surface text-blackdark rounded-10px focus:outline-primary focus:outline-1 w-full placeholder:text-primarygray truncate ${className} ${error ? '!border-red-500' : ''}
                        ${isDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                  wrapperClassName='w-full'
                  ref={datePickerRef}
                  placeholderText={placeholder}
                  popperClassName='time_picker_parent'
                  disabled={isDisabled}
                  clearButtonClassName='!right-8'
                  autoComplete='off'
                />
              )}
            />
          ) : (
            <DatePicker
              {...restProps}
              selected={toDisplayDate(startDate)}
              {...(minDate && { minDate: toDisplayDate(minDate) })}
              {...(maxDate && { maxDate: toDisplayDate(maxDate) })}
              {...(minTime && { minTime: toDisplayDate(minTime) })}
              {...(maxTime && { maxTime: toDisplayDate(maxTime) })}
              onChange={val => handleDateChange(toUtcDate(val))}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={timeIntervals}
              name={name}
              injectTimes={injectedTimes}
              timeCaption='Time'
              isClearable={isClearable}
              filterTime={filterTime}
              isLoading={isLoading}
              showPopperArrow={false}
              dateFormat='h:mm aa'
              className={`px-4 pr-8 py-2.5 border border-solid border-surface text-blackdark rounded-10px focus:outline-primary focus:outline-1 w-full placeholder:text-primarygray truncate ${className} ${error ? '!border-red-500' : ''}
                        ${isDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              wrapperClassName='w-full'
              ref={datePickerRef}
              placeholderText={placeholder}
              popperClassName='time_picker_parent'
              disabled={isDisabled}
              clearButtonClassName='!right-8'
              autoComplete='off'
            />
          )}

          <div
            onClick={handleIconClick}
            className={`absolute right-3 top-2/4 -translate-y-2/4 ${
              isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
          >
            <Icon name='Timer' className='text-blackdark icon-wrapper w-18px h-18px' />
          </div>
        </div>
      </div>
      {error && <p className={`helper__text text-red-500 text-xs mt-1.5 ${errorClass}`}>{error}</p>}
    </div>
  );
};

export default TimeSelect;
