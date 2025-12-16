import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { enGB } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datePicker.css';
import ReactDOM from 'react-dom';

import Button from '@/stories/Common/Button';
import Icon, { type IconNameType } from '@/stories/Common/Icon';
import Select from '@/stories/Common/Select';

export interface CustomDateClass {
  date: Date;
  className: string;
}
export interface CustomDatePickerProps {
  selected: Date | string | null;
  onChange: (date: Date | string) => void;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  placeholderText?: string;
  showTimeSelect?: boolean;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
  scrollableYearDropdown?: boolean;
  dropdownMode?: 'scroll' | 'select';
  className?: string;
  isClearable?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  error?: string;
  inline?: boolean;
  label?: string;
  labelClass?: string;
  isRequired?: boolean;
  parentClassName?: string;
  iconClassName?: string;
  icons?: IconNameType;
  showIcon?: boolean;
  headerClassName?: string;
  legendIndicator?: boolean;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  customDateClasses?: CustomDateClass[];
  maxAge?: number;
  portalRootId?: string;
  onMonthChange?: (date?: Date | string) => void;
  timeIntervals?: number;
  timeCaption?: string;
}
type SelectOption = { label: string; value: number };

export const CustomDatePicker = React.forwardRef<HTMLDivElement, CustomDatePickerProps>(
  (
    {
      selected,
      onChange,
      minDate,
      maxDate,
      dateFormat = 'dd/MM/yyyy',
      placeholderText = 'Select date',
      showTimeSelect = false,
      showMonthDropdown = true,
      showYearDropdown = true,
      scrollableYearDropdown = false,
      dropdownMode = 'scroll',
      className,
      isClearable = false,
      disabled = false,
      name,
      id,
      error,
      inline,
      label,
      labelClass,
      isRequired,
      parentClassName,
      iconClassName,
      icons = 'calendar',
      showIcon = true,
      headerClassName,
      legendIndicator = false,
      placement = 'bottom-start',
      customDateClasses = [],
      maxAge,
      onMonthChange,
      portalRootId = '',
      timeIntervals = 30,
      timeCaption = 'Time',
      ...props
    },
    ref
  ) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const yearOptions = React.useMemo(() => {
      const currentYear = new Date().getFullYear();
      const minYear = minDate ? minDate.getFullYear() : maxAge ? currentYear - maxAge : 1900;
      const maxYear = maxDate ? maxDate.getFullYear() : currentYear;

      return Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        const year = minYear + i;
        return { label: year.toString(), value: year };
      });
    }, [minDate, maxDate, maxAge]);

    const [open, setOpen] = useState<boolean>(false);
    const datePickerRef = useRef<DatePicker>(null!);
    const containerRef = useRef<HTMLDivElement>(null);
    const [calendarWidth, setCalendarWidth] = useState<number | undefined>(undefined);

    const handleIconClick = () => {
      if (!disabled) {
        setOpen(prev => !prev);
        setTimeout(() => {
          datePickerRef.current?.input?.focus();
        }, 0);
      }
    };

    const [dynamicPlacement, setDynamicPlacement] = useState<
      'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
    >(placement);

    // Function to get custom class for a specific date
    const getCustomDateClass = (date: Date): string => {
      const customClass = customDateClasses.find(
        customDate =>
          customDate.date.getDate() === date.getDate() &&
          customDate.date.getMonth() === date.getMonth() &&
          customDate.date.getFullYear() === date.getFullYear()
      );
      return customClass?.className || '';
    };

    useEffect(() => {
      if (datePickerRef.current) {
        const rect = datePickerRef.current.input?.getBoundingClientRect();
        const modalParent = document.querySelector('.modal-parent');

        let availableRightSpace = window.innerWidth - (rect?.right ?? 0);
        let availableLeftSpace = rect?.left ?? 0;

        if (modalParent) {
          const modalRect = modalParent.getBoundingClientRect();
          availableRightSpace = modalRect.right - (rect?.right ?? 0);
          availableLeftSpace = (rect?.left ?? 0) - modalRect.left;
        }

        // Adjust width calculation for side-by-side layout
        const requiredWidth = showTimeSelect ? 500 : 300;

        if (availableRightSpace < requiredWidth) {
          setDynamicPlacement('bottom-start');
        } else if (availableLeftSpace < requiredWidth) {
          setDynamicPlacement('bottom-end');
        } else {
          setDynamicPlacement(placement);
        }
      }
    }, [placement, open, showTimeSelect]);

    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          const inputEl = containerRef.current.querySelector('input');
          if (inputEl) {
            // Set wider calendar width when time picker is enabled
            const baseWidth = inputEl.offsetWidth;
            if (window.innerWidth < 640) {
              // Mobile
              setCalendarWidth(showTimeSelect ? Math.max(baseWidth, 250) : baseWidth);
            } else {
              // Tablet/Desktop
              setCalendarWidth(showTimeSelect ? Math.max(baseWidth, 480) : baseWidth);
            }
          }
        }
      };

      updateWidth();

      window.addEventListener('resize', updateWidth);

      return () => window.removeEventListener('resize', updateWidth);
    }, [open, showTimeSelect]);

    return (
      <>
        <div
          ref={ref}
          className={clsx('w-full z-40', parentClassName, inline ? 'inline-datepicker' : '')}
        >
          {label && (
            <label
              className={`flex items-center gap-1 text-blackdark text-base font-normal leading-5 whitespace-nowrap mb-1.5 ${labelClass}`}
            >
              {label} {isRequired && <span className='text-red-500 font-medium'>*</span>}
            </label>
          )}
          <div ref={containerRef} className='relative'>
            <DatePicker
              ref={datePickerRef}
              selected={
                selected ? (selected instanceof Date ? selected : new Date(selected)) : null
              }
              onChange={onChange}
              minDate={minDate}
              showIcon={true}
              maxDate={maxDate}
              onMonthChange={onMonthChange}
              dateFormat={showTimeSelect ? `${dateFormat} HH:mm` : dateFormat}
              placeholderText={placeholderText}
              showTimeSelect={showTimeSelect}
              timeIntervals={timeIntervals}
              timeCaption={timeCaption}
              showMonthDropdown={showMonthDropdown}
              showYearDropdown={showYearDropdown}
              scrollableYearDropdown={scrollableYearDropdown}
              dropdownMode={dropdownMode}
              className={clsx(
                className,
                showTimeSelect ? 'time-picker-enabled' : '',
                error ? 'error' : ''
              )}
              isClearable={isClearable}
              disabled={disabled}
              name={name}
              popperPlacement={dynamicPlacement}
              showDateSelect={true}
              inline={inline}
              id={id}
              showPopperArrow={false}
              locale={enGB}
              calendarStartDay={1}
              dayClassName={date =>
                clsx(
                  getCustomDateClass(date), // keep your existing custom highlighting
                  'flex items-center justify-center text-xs sm:text-sm',
                  '!w-[25px] !min-w-[25px] !h-[25px] !text-xs sm:!text-base sm:!w-10 sm:!min-w-10 sm:!h-10' // responsive sizing for both days & day names
                )
              }
              calendarClassName='w-[250px] sm:w-auto'
              popperContainer={({ children }) =>
                ReactDOM.createPortal(
                  <div
                    className={clsx(
                      'relative datepicker-portal !bg-white',
                      showTimeSelect ? 'with-time-picker' : 'date-only'
                    )}
                    style={{ width: calendarWidth, zIndex: 9999 }}
                  >
                    {children}
                  </div>,
                  document.body
                )
              }
              {...props}
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <>
                  <div
                    className={clsx(
                      'flex items-center justify-between bg-surface py-2.5 px-5 rounded-t-10px',
                      showTimeSelect ? 'calendar-header-with-time' : '',
                      headerClassName
                    )}
                  >
                    <Button
                      variant='none'
                      onClick={decreaseMonth}
                      isDisabled={prevMonthButtonDisabled}
                      className='!p-0'
                      icon={<Icon name='calendarLeftArrow' className='text-blackdark' />}
                    />
                    <span className='sm:text-base text-sm font-semibold leading-22px text-blackdark'>
                      {date?.toLocaleString('default', { month: 'long' })} {date?.getFullYear()}
                    </span>
                    <Button
                      variant='none'
                      onClick={increaseMonth}
                      isDisabled={nextMonthButtonDisabled}
                      className='!p-0'
                      icon={<Icon name='calendarRightArrow' className='text-blackdark' />}
                    />
                  </div>
                  <div
                    className={clsx(
                      'flex items-center justify-between sm:gap-5 gap-1 mt-3',
                      inline ? '' : 'sm:px-5 px-2'
                    )}
                  >
                    {/* Month Dropdown */}
                    <Select
                      options={months.map((month, index) => ({
                        label: month,
                        value: index,
                      }))}
                      value={{
                        label: months[date.getMonth()],
                        value: date.getMonth(),
                      }}
                      onChange={option => changeMonth((option as SelectOption).value)}
                      isClearable={false}
                      isSearchable={false}
                      parentClassName='w-1/2'
                      StylesConfig={{
                        control: () => ({
                          background: 'transparent',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                        menu: () => ({
                          background: '#F8FBFF',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                        singleValue: () => ({
                          textAlign: 'left',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                        option: () => ({
                          textAlign: 'left',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                      }}
                      portalRootId={portalRootId}
                    />
                    {/* Year Dropdown */}
                    <Select
                      options={yearOptions}
                      value={{
                        label: date.getFullYear().toString(),
                        value: date.getFullYear(),
                      }}
                      onChange={option => changeYear((option as SelectOption).value)}
                      isClearable={false}
                      isSearchable={false}
                      parentClassName='w-1/2'
                      StylesConfig={{
                        control: () => ({
                          background: 'transparent',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                        menu: () => ({
                          background: '#F8FBFF',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                        singleValue: () => ({
                          textAlign: 'left',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                        option: () => ({
                          textAlign: 'left',
                          '@media (max-width: 640px)': {
                            fontSize: '14px',
                          },
                        }),
                      }}
                      portalRootId={portalRootId}
                    />
                  </div>
                </>
              )}
            />
            {showIcon && (
              <div
                onClick={handleIconClick}
                className={clsx(
                  'absolute top-2/4 -translate-y-2/4 right-3.5',
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                <Icon name={icons} className={clsx('', iconClassName)} />
              </div>
            )}
          </div>
          {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
        </div>
        {legendIndicator && (
          <ul className='flex items-center gap-5 flex-wrap mt-5'>
            <li className='flex items-center gap-1.5'>
              <span className='w-3.5 h-3.5 rounded-full bg-primary'></span>
              <span className='text-sm font-semibold leading-18px text-primarygray'>Today</span>
            </li>
            <li className='flex items-center gap-1.5'>
              <span className='w-3.5 h-3.5 rounded-full bg-greendarklight border border-primary'></span>
              <span className='text-sm font-semibold leading-18px text-primarygray'>Selection</span>
            </li>
            <li className='flex items-center gap-1.5'>
              <span className='w-3.5 h-3.5 rounded-full bg-Green'></span>
              <span className='text-sm font-semibold leading-18px text-primarygray'>Available</span>
            </li>
            {/* <li className='flex items-center gap-1.5'>
            <span className='w-3.5 h-3.5 rounded-full bg-primary/20'></span>
            <span className='text-sm font-semibold leading-18px text-primarygray'>
              Not Available/ Previous Day
            </span>
          </li> */}
          </ul>
        )}
      </>
    );
  }
);

export default CustomDatePicker;
