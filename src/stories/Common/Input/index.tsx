import {
  forwardRef,
  type ChangeEventHandler,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
  type Ref,
} from 'react';

import clsx from 'clsx';
import _ from 'lodash';

import { Icon, type IconNameType } from '@/stories/Common/Icon';

import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';

export interface InputFieldProps<TFormValues extends FieldValues = FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type: HTMLInputTypeAttribute;
  label?: string;
  labelClass?: string;
  isRequired?: boolean;
  icon?: IconNameType;
  onIconClick?: () => void;
  register?: UseFormRegister<TFormValues>;
  inputClass?: string;
  parentClassName?: string;
  inputParentClassName?: string;
  value?: string | number | undefined;
  isDisabled?: boolean;
  name?: Path<TFormValues>;
  error?: string;
  errorClass?: string;
  multiple?: boolean | undefined;
  accept?: string;
  maxLength?: number;
  iconClassName?: string;
  iconFirst?: boolean;
  lastIconParentClassName?: string;
  lastIconClassName?: string;
  viewPasswordIcon?: boolean;
  info?: string;
  infoClass?: string;
  infoIcon?: boolean;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  show?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

const InputFieldInner = <TFormValues extends FieldValues = FieldValues>(
  {
    onChange,
    placeholder,
    type,
    label,
    labelClass,
    isRequired,
    icon,
    onIconClick,
    register,
    inputClass,
    parentClassName,
    inputParentClassName,
    value,
    isDisabled = false,
    name,
    error,
    errorClass,
    multiple,
    accept,
    maxLength,
    iconClassName,
    autoComplete = 'off',
    iconFirst = false,
    lastIconParentClassName,
    lastIconClassName,
    setShow,
    show = false,
    viewPasswordIcon = false,
    infoIcon = false,
    info,
    infoClass,
    inputRef,
    ...otherProps
  }: InputFieldProps<TFormValues>,
  forwardedRef: React.Ref<HTMLDivElement>
) => {
  return (
    <div className={clsx('relative', parentClassName)}>
      {label && (
        <label
          className={clsx('text-blackdark text-sm font-normal mb-1.5 block leading-5', labelClass)}
        >
          {label}
          {isRequired && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <div className={clsx('relative', inputParentClassName)} ref={forwardedRef}>
        <input
          {...otherProps}
          ref={inputRef}
          type={type}
          disabled={isDisabled}
          accept={accept}
          multiple={multiple}
          {...(name && { name })}
          className={clsx(
            'w-full py-3.5 px-3.5 border border-solid border-surface rounded-10px text-sm text-blackdark placeholder:text-primarygray focus:outline-1 focus:outline-primary transition-all ease-in-out duration-300',
            iconFirst ? 'pl-11' : '',
            inputClass,
            {
              '!border-red-500 focus:!outline-none': error,
              'opacity-50 cursor-not-allowed': isDisabled,
            }
          )}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          {...(register &&
            name &&
            register(name, {
              onChange,
              setValueAs: val => (_.isString(val) ? val.trim() : val),
            }))}
          maxLength={maxLength}
        />

        {icon && (
          <div
            className={clsx(
              'absolute top-1/2 transform -translate-y-1/2 text-primarygray cursor-pointer',
              iconFirst ? 'left-3' : 'right-3',
              iconClassName
            )}
            onClick={onIconClick}
          >
            <Icon width={19} height={19} name={icon} />
          </div>
        )}

        {viewPasswordIcon && (
          <div
            className={clsx(
              'absolute right-3 top-2/4 -translate-y-2/4 text-primarygray cursor-pointer',
              lastIconParentClassName
            )}
            onClick={setShow ? () => setShow(prev => !prev) : undefined}
          >
            <Icon
              name={show ? 'passwordVisible' : 'passwordEye'}
              className={clsx('icon-wrapper w-5 h-5', lastIconClassName)}
            />
          </div>
        )}
      </div>

      {info && (
        <p className={clsx('text-xs flex items-center gap-1 text-gray-500 mt-1.5', infoClass)}>
          {infoIcon && <Icon name='info' width={14} height={13} />}
          {info}
        </p>
      )}

      {error && <p className={clsx('text-xs text-red-500 mt-1.5', errorClass)}>{error}</p>}
    </div>
  );
};

export const InputField = forwardRef(InputFieldInner) as <
  TFormValues extends FieldValues = FieldValues,
>(
  props: InputFieldProps<TFormValues> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

export default InputField;
