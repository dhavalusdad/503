import clsx from 'clsx';
import {
  type ChangeEventHandler,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes
} from 'react';
import Icon, {type IconNameType } from '@/stories/Common/Icon';

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type: HTMLInputTypeAttribute;
  label?: string;
  labelClass?: string;
  isRequired?: boolean;
  icon?: IconNameType;
  onIconClick?: () => void;
  inputClass?: string;
  parentClassName?: string;
  inputParentClassName?: string;
  value?: string | number;
  isDisabled?: boolean;
  error?: string;
  errorClass?: string;
  iconClassName?: string;
}

export default function InputField({
  onChange,
  placeholder,
  type,
  label,
  labelClass,
  isRequired,
  icon,
  onIconClick,
  inputClass,
  parentClassName,
  inputParentClassName,
  value,
  isDisabled = false,
  error,
  errorClass,
  iconClassName,
  autoComplete = 'off',
  ...otherProps
}: InputFieldProps) {
  return (
    <div className={clsx('relative', parentClassName)}>
      {label && (
        <label className={clsx('text-gray-800 text-sm font-medium mb-1 block', labelClass)}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={clsx('relative', inputParentClassName)}>
        <input
          type={type}
          disabled={isDisabled}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          {...otherProps}
          className={clsx(
            'w-full px-3 py-2 border rounded-md text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
            inputClass,
            {
              'border-red-500': error,
              'opacity-50 cursor-not-allowed': isDisabled
            }
          )}
        />
        {icon && (
          <div
            className={clsx(
              'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer',
              iconClassName
            )}
            onClick={onIconClick}
          >
            <Icon name={icon} />
          </div>
        )}
        {error && (
          <p className={clsx('text-xs text-red-500 mt-1', errorClass)}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
