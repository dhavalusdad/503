import Button from '@/stories/Common/Button';

type Option = {
  value: string;
  label: string;
};

interface ButtonGroupProps {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  disabled?: boolean;
}

const SelectButtonGroup = ({ value, onChange, options, disabled = false }: ButtonGroupProps) => {
  return (
    <div className='flex gap-2'>
      {options.map(opt => (
        <Button
          variant={value == opt.value || disabled ? 'filled' : 'outline'}
          title={opt.label}
          type='button'
          key={opt.value}
          onClick={() => !disabled && onChange(opt.value)}
          className={`rounded-lg`}
        />
      ))}
    </div>
  );
};

export default SelectButtonGroup;
