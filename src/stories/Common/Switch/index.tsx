import type React from 'react';

import cx from 'classnames';

export const Switch = ({
  label = '',
  parentClassName,
  labelClassName,
  size = 'md',
  error,
  isLabelFirst = false,
  isDisabled = false,
  onChange,
  isWatchRegister = false,
  checkWrapClassName,
  isCustomSwitch = false,
  inputClassName = '',
  isChecked = undefined,
  onBlur,
}: {
  label?: string;
  parentClassName?: string;
  labelClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  border?: 'sm' | 'md';
  error?: string;
  isLabelFirst?: boolean;
  isChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (...event: React.ChangeEvent<HTMLInputElement>[]) => void;
  isWatchRegister?: boolean;
  checkWrapClassName?: string;
  isCustomSwitch?: boolean;
  inputClassName?: string;
  onBlur?: (...event: React.FocusEvent<HTMLInputElement>[]) => void;
}) => {
  const checkWrapClass = cx(
    `relative flex items-center w-9 h-5 rounded-full bg-black/30 peer-checked:bg-Green transition-all ease-in-out duration-300 ${checkWrapClassName}`
  );
  const checkClass = cx(
    'absolute left-0.5 right-auto bg-white w-3.5 h-3.5 rounded-full peer-checked:bg-white peer-checked:left-auto peer-checked:right-0.5 z-[1] transition-all ease-in-out duration-300'
  );

  return (
    <div className={`relative inline-block gap-2 ${parentClassName}`}>
      <label
        className={`flex items-center gap-3 ${
          isDisabled ? 'cursor-not-allowed opacity-60 select-none' : 'cursor-pointer'
        } `}
      >
        {isLabelFirst && label ? <p className={`${labelClassName} font-bold`}>{label}</p> : ''}
        <span
          className={`relative flex items-center ${
            isDisabled && 'pointer-events-none select-none'
          } `}
        >
          {isCustomSwitch ? (
            <input
              type='checkbox'
              className={`peer rounded appearance-none  absolute inset-0 opacity-0 ${size} ${inputClassName}`}
              disabled={isDisabled}
              checked={isChecked}
            />
          ) : isWatchRegister ? (
            <input
              type='checkbox'
              className={` peer rounded appearance-none  absolute inset-0 opacity-0 ${size} ${inputClassName}`}
              name=''
              id=''
              checked={isChecked}
              disabled={isDisabled}
            />
          ) : (
            <input
              type='checkbox'
              className={`peer rounded appearance-none  absolute inset-0 opacity-0 ${size} ${inputClassName}`}
              name=''
              id=''
              onChange={onChange}
              disabled={isDisabled}
              onBlur={onBlur}
              checked={isChecked}
            />
          )}
          <span className={checkWrapClass}></span>
          <span className={checkClass}></span>
        </span>
        {!isLabelFirst && label ? <p className={`${labelClassName} font-bold`}>{label}</p> : ''}
      </label>
      {error && (
        <div className={'flex w-full'}>
          <p className='text-Red-500 text-xs'>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Switch;
