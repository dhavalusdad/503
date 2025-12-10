import React from 'react';

import clsx from 'clsx';

import type { FieldValues, UseFormRegister } from 'react-hook-form';

interface TextAreaProps<TFormValues extends FieldValues> {
  label?: string;
  placeholder?: string;
  error?: string;
  register?: UseFormRegister<TFormValues>; //fix
  rows?: number;
  className?: string;
  name?: string;
  parentClassName?: string;
  labelClass?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  value?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps<FieldValues>>(
  (
    {
      label,
      placeholder = '',
      error,
      register,
      rows = 4,
      className = '',
      name,
      parentClassName = '',
      onChange,
      labelClass = '',
      isDisabled = false,
      isRequired = false,
      onKeyDown,
      onPaste,
      // value = '',
      ...otherProps
    },
    ref: React.Ref<HTMLTextAreaElement>
  ) => {
    return (
      <div className={clsx('relative', parentClassName)}>
        {label && (
          <label
            className={clsx(
              'text-blackdark text-sm font-normal mb-1.5 block leading-5',
              labelClass
            )}
          >
            {label}
            {isRequired && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}
        <div ref={ref as React.Ref<HTMLDivElement>}>
          <textarea
            disabled={isDisabled}
            // value={value}
            id={name}
            {...(register && name ? register(name) : { onChange })}
            rows={rows}
            onKeyDown={onKeyDown}
            ref={ref}
            placeholder={placeholder}
            className={clsx(
              'w-full p-3.5 border border-solid border-surface rounded-10px text-sm text-blackdark placeholder:text-primarygray focus:outline-1 focus:outline-primary transition-all ease-in-out duration-300',
              className,
              error ? 'border-red-500 focus:!outline-0' : ''
            )}
            name={name}
            onPaste={onPaste}
            {...otherProps}
          />
        </div>
        {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
      </div>
    );
  }
);

export default TextArea;
