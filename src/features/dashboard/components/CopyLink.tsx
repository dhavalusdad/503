import React, { useState } from 'react';

import clsx from 'clsx';

import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';

interface CopyLinkProps {
  label?: string;
  value: string;
  helperText?: string;
  isRequired?: boolean;
  parentClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  error?: string;
  prefixText?: string;
  isDisabled?: boolean;
}

export const CopyLink: React.FC<CopyLinkProps> = ({
  label,
  value,
  helperText,
  isRequired = false,
  parentClassName = '',
  labelClassName = '',
  inputClassName = '',
  buttonClassName = '',
  error = '',
  prefixText = 'Link',
  isDisabled = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (isDisabled) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={clsx('relative w-full', parentClassName)}>
      {label && (
        <label
          htmlFor='copy-input'
          className={clsx(
            'text-blackdark text-sm font-normal mb-1.5 block leading-5',
            labelClassName
          )}
        >
          {label}
          {isRequired && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <div className='flex items-center relative'>
        {/* Prefix Label */}
        {prefixText && (
          <span className='inline-flex items-center sm:py-3.5 sm:px-3.5 text-sm font-medium text-blackdark bg-surface border border-r-0 border-surface rounded-l-10px'>
            {prefixText}
          </span>
        )}

        {/* Input */}
        <InputField
          type='text'
          value={value}
          parentClassName='w-full !bg-white'
          isDisabled
          inputClass={clsx(
            'truncate !border-blackdark/15 !bg-Gray !rounded-none border-l-0 border-r-0',
            error ? 'border-red-500' : '',
            inputClassName
          )}
        />

        {/* Copy Button */}
        <Button
          onClick={handleCopy}
          variant='filled'
          isDisabled={isDisabled}
          className={clsx('!rounded-l-none !rounded-r-10px !py-3.5', buttonClassName)}
          type='button'
          icon={<Icon name={copied ? 'check' : 'file'} className='icon-wrapper w-5 h-5' />}
        />

        {/* Tooltip */}
        {copied && (
          <div className='absolute right-0 -top-10 px-3 py-2 text-sm font-medium text-white bg-blackdark rounded-lg shadow-md z-10 animate-fade-in'>
            Copied!
          </div>
        )}
      </div>

      {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}

      {helperText && !error && (
        <p className='mt-1.5 text-sm text-primarygray leading-5'>{helperText}</p>
      )}
    </div>
  );
};
