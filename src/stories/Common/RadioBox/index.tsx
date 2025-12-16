import clsx from 'clsx';

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioFieldProps {
  id: string;
  label?: string | React.ReactNode;
  name?: string;
  value?: string;
  isChecked?: boolean;
  isDefaultChecked?: boolean;
  onChange?: (value: string | React.ChangeEvent<HTMLInputElement>) => void;
  options?: RadioOption[];
  className?: string;
  labelClass?: string;
  parentClassName?: string;
  isDisabled?: boolean;
  labelPlacement?: 'start' | 'end';
  errorMessage?: string;
}

export const RadioField: React.FC<RadioFieldProps> = ({
  id,
  label,
  name,
  value,
  isChecked,
  isDefaultChecked,
  onChange,
  options,
  className,
  labelClass,
  parentClassName,
  isDisabled = false,
  labelPlacement = 'end',
  errorMessage,
}) => {
  const renderLabel = (htmlFor?: string, text?: string) =>
    text ? (
      <label
        htmlFor={htmlFor}
        className={clsx(
          'text-base text-blackdark leading-5 font-normal cursor-pointer',
          labelClass
        )}
      >
        {text}
      </label>
    ) : null;

  // Single radio
  if (!options) {
    return (
      <div className={clsx('relative flex items-center gap-2.5', parentClassName)}>
        {labelPlacement === 'start' && renderLabel(id, label)}
        <input
          id={id}
          type='radio'
          name={name}
          value={value}
          checked={isChecked}
          defaultChecked={isDefaultChecked}
          disabled={isDisabled}
          onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
          className={clsx(
            'w-4 h-4 rounded-full accent-primarygray checked:accent-blackdark cursor-pointer',
            className
          )}
        />
        {labelPlacement === 'end' && renderLabel(id, label)}
        {errorMessage && <p className='text-sm text-red-500 mt-1'>{errorMessage}</p>}
      </div>
    );
  }

  // Dynamic/multiple radios
  return (
    <div className={clsx('flex flex-col gap-2', parentClassName)}>
      {label && (
        <span className={clsx('text-base font-medium text-gray-800', labelClass)}>{label}</span>
      )}
      <div className='flex gap-6'>
        {options.map((opt, idx) => (
          <label
            key={`${id}-${idx}`}
            htmlFor={`${id}-${idx}`}
            className='flex items-center gap-2 cursor-pointer'
          >
            <input
              id={`${id}-${idx}`}
              type='radio'
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={isDisabled}
              onChange={() => onChange?.(opt.value)}
              className={clsx(
                'w-4 h-4 rounded-full accent-primarygray checked:accent-blackdark cursor-pointer',
                className
              )}
            />
            <span className='text-sm text-gray-800'>{opt.label}</span>
          </label>
        ))}
      </div>
      {errorMessage && <p className='text-sm text-red-500 mt-1'>{errorMessage}</p>}
    </div>
  );
};

export default RadioField;
