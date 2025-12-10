import React from 'react';

import clsx from 'clsx';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from 'react-hook-form';

interface CheckboxProps<TFormValues extends FieldValues> {
  id: string;
  label?: string | React.ReactNode;
  isChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  labelPlacement?: 'start' | 'end';
  name?: Path<TFormValues>;
  value?: string | boolean;
  isDefaultChecked?: boolean;
  labelClass?: string;
  parentClassName?: string;
  isDisabled?: boolean;
  register?: UseFormRegister<TFormValues>;
  control?: Control<TFormValues>;
}

export const CheckboxField = React.forwardRef<HTMLDivElement, CheckboxProps<FieldValues>>(
  <TFormValues extends FieldValues>(
    {
      id,
      label,
      isChecked,
      isDefaultChecked,
      isDisabled = false,
      onChange,
      className,
      labelPlacement = 'end',
      name,
      value,
      labelClass,
      parentClassName,
      register,
      control,
    }: CheckboxProps<TFormValues>,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const renderLabel = () =>
      label ? (
        <label
          htmlFor={id}
          className={clsx(
            'text-sm text-blackdark leading-5 cursor-pointer w-[calc(100%-30px)]',
            labelClass
          )}
        >
          {label}
        </label>
      ) : null;

    return (
      <div className={`relative inline-flex items-center gap-2 ${parentClassName}`} ref={ref}>
        {labelPlacement === 'start' && renderLabel()}

        {name && control ? (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <input
                id={id}
                type='checkbox'
                name={name}
                value={field.value}
                disabled={isDisabled}
                checked={field.value}
                onChange={val => {
                  field.onChange(val);
                  onChange?.(val);
                }}
                className={clsx(
                  'checkbox_icon h-18px w-18px appearance-none border-2 border-primary rounded cursor-pointer checked:bg-primary checked:border-primary relative checked:before:absolute checked:before:left-1/2 checked:before:top-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:text-lg',
                  className,
                  { 'opacity-50 !cursor-not-allowed': isDisabled }
                )}
                defaultChecked={isDefaultChecked}
              />
            )}
          />
        ) : (
          <input
            id={id}
            type='checkbox'
            value={value as string}
            disabled={isDisabled}
            checked={isChecked}
            {...(register && name ? register(name) : {})}
            name={name}
            onChange={e => {
              if (register && name) {
                register(name).onChange(e);
              }
              if (onChange) {
                onChange(e);
              }
            }}
            className={clsx(
              'checkbox_icon h-18px w-18px appearance-none border-2 border-primary rounded cursor-pointer checked:bg-primary checked:border-primary relative checked:before:absolute checked:before:left-1/2 checked:before:top-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:text-lg',
              className,
              { 'opacity-50 !cursor-not-allowed': isDisabled }
            )}
            defaultChecked={isDefaultChecked}
          />
        )}

        {labelPlacement === 'end' && renderLabel()}
      </div>
    );
  }
);

export default CheckboxField;
