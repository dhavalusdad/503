import React, { useEffect, useRef, useState, forwardRef } from 'react';

import clsx from 'clsx';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import PhoneInput, { type CountryData, type PhoneInputProps } from 'react-phone-input-2';

import 'react-phone-input-2/lib/style.css';
import './styles.css';

interface PhoneInputEventProps {
  onChange: (formattedValue: string) => void;
  onMount: (value: string, data: CountryData | object, formattedValue: string) => void;
}

export interface PhoneFieldProps<TFieldValues extends FieldValues = FieldValues>
  extends PhoneInputProps {
  label?: string;
  labelClass?: string;
  isRequired?: boolean;
  inputClass?: string;
  parentClassName?: string;
  inputParentClassName?: string;
  error?: string;
  isReadOnly?: boolean;
  onChange?: PhoneInputEventProps['onChange'];
  onMount?: PhoneInputEventProps['onMount'];
  portalId?: string;
  isModal?: boolean;
  control?: Control<TFieldValues>;
  name: Path<TFieldValues>;
}

export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps<FieldValues>>(
  <TFieldValues extends FieldValues>(
    {
      label,
      labelClass,
      isRequired,
      parentClassName,
      inputParentClassName,
      country = 'us',
      enableSearch = true,
      inputClass,
      buttonClass,
      error,
      isReadOnly = false,
      disabled,
      onChange,
      onMount,
      portalId = '',
      dropdownClass,
      isModal = false,
      value,
      name,
      control,
      ...props
    }: PhoneFieldProps<TFieldValues>,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const [dropDownPosition, setDropDownPosition] = useState<number>(0);
    const phoneDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (portalId && !isReadOnly) {
        const updateDropDownPosition = () => {
          if (phoneDivRef.current) {
            const scrollTop = phoneDivRef.current.getBoundingClientRect();
            setDropDownPosition(scrollTop.top);
          }
        };

        updateDropDownPosition();
        window.addEventListener('resize', updateDropDownPosition);
        const portalElement = document.querySelector(`#${portalId}`);
        const scrollContainer = isModal
          ? portalElement?.querySelector('#modal_body')
          : portalElement;

        scrollContainer?.addEventListener('scroll', updateDropDownPosition);

        const observer = new MutationObserver(updateDropDownPosition);

        if (phoneDivRef.current) {
          observer.observe(phoneDivRef.current, {
            childList: true,
          });
        }

        return () => {
          scrollContainer?.removeEventListener('scroll', updateDropDownPosition);
          window.removeEventListener('resize', updateDropDownPosition);
          observer.disconnect();
        };
      }
    }, [portalId, isReadOnly]);

    if (isReadOnly && (!value || value === '-')) {
      return <span className='text-sm text-primarygray'>-</span>;
    }

    const commonProps = {
      value,
      dropdownStyle: portalId ? { top: dropDownPosition } : undefined,
      country,
      enableAreaCodes: true,
      enableSearch,
      dropdownClass: clsx(dropdownClass, {
        '!fixed !z-10 !mt-12 ': !!portalId,
      }),
      ...props,
      containerClass: '',
      inputClass: clsx(
        'phonefield_input !h-auto text-sm !leading-5 p-3.5 !rounded-10px text-blackdark',
        inputClass,
        error && '!border-red-500 focus:!outline-0',
        isReadOnly
          ? '!cursor-text !w-auto'
          : '!bg-Gray-400 !border !border-solid border-Gray-200 !w-full'
      ),
      buttonClass: clsx(
        'dropdown_button',
        buttonClass,
        isReadOnly && '!hidden',
        {
          '!border-red-500 focus:!outline-0': error,
        },
        disabled ? 'opacity-50 !cursor-not-allowed' : ''
      ),
      searchClass: '',
      onMount,
      onChange: (_value: string, _data: unknown, _event: unknown, formattedValue: string) => {
        onChange?.(formattedValue);
      },
      disabled: isReadOnly || disabled,
    };

    return (
      <div className={clsx('relative group', parentClassName)}>
        {label && (
          <label
            className={clsx(
              'text-blackdark text-sm font-normal mb-1.5 block leading-5',
              labelClass,
              isReadOnly && '!hidden'
            )}
          >
            {label} {isRequired && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}
        <div ref={ref}>
          <div ref={phoneDivRef} className={clsx('relative', inputParentClassName)}>
            {name && control ? (
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    {...commonProps}
                    onChange={(value, data, event, formattedValue) => {
                      field.onChange(formattedValue);
                      onChange?.(formattedValue);
                    }}
                    value={field.value}
                  />
                )}
              />
            ) : (
              <PhoneInput {...commonProps} />
            )}
            {error && (
              <p className={clsx('text-red-500 text-xs mt-1.5', isReadOnly && '!hidden')}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default PhoneField;
