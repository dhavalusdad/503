import { type ChangeEventHandler, type JSX } from 'react';

import clsx from 'clsx';

import { Icon } from '@/stories/Common/Icon';

interface InputFileUploadFieldProps {
  id?: string;
  label?: string;
  labelClass?: string;
  isRequired?: boolean;
  accept?: string;
  multiple?: boolean;
  onFileSelect: (files: FileList | null) => void;
  buttonLabel?: string;
  parentClassName?: string;
  error?: string;
  errorClass?: string;
  info?: string;
  infoClass?: string;
  infoIcon?: boolean;
}

export const InputFileUploadField = ({
  id = 'file-upload',
  label,
  labelClass,
  isRequired,
  accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  multiple = false,
  onFileSelect,
  parentClassName,
  error,
  errorClass,
  info,
  infoClass,
  infoIcon = false,
}: InputFileUploadFieldProps): JSX.Element => {
  const handleChange = (e: ChangeEventHandler<HTMLInputElement>) => {
    onFileSelect(e?.target?.files);
  };

  return (
    <div className={clsx('relative', parentClassName)}>
      {label && (
        <label
          htmlFor={id}
          className={clsx('text-blackdark text-sm font-normal mb-1.5 block leading-5', labelClass)}
        >
          {label}
          {isRequired && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      {/* Hidden Input */}
      <input
        id={id}
        type='file'
        className='hidden'
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />

      {/* Custom Trigger Button */}
      {/* <label
        htmlFor={id}
        className='cursor-pointer inline-block bg-primary text-white text-sm px-4 py-2 rounded-md hover:bg-primary-dark transition-all duration-200'
      >
        {buttonLabel}
      </label> */}

      {/* Info Message */}
      {info && (
        <p className={clsx('text-xs flex items-center gap-1 text-gray-500 mt-1.5', infoClass)}>
          {infoIcon && <Icon name='info' width={14} height={13} />}
          {info}
        </p>
      )}

      {/* Error Message */}
      {error && <p className={clsx('text-xs text-red-500 mt-1.5', errorClass)}>{error}</p>}
    </div>
  );
};

export default InputFileUploadField;
