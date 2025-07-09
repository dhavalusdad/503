import InputField, { type InputFieldProps } from '@/stories/Common/Input';
import { useState, type ChangeEventHandler } from 'react';

interface PasswordFieldProps extends InputFieldProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  label?: string;
  labelClass?: string;
  inputClass?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  parentClassName?: string;
}

export const PasswordField = (props: Omit<PasswordFieldProps, 'type'>) => {
  const [show, setShow] = useState(false);

  return (
    <InputField
      {...props}
      type={show ? 'text' : 'password'}
      icon={show ? 'passwordVisible' : 'passwordEye'} 
      onIconClick={() => setShow(prev => !prev)}
      autoComplete={props.autoComplete || 'new-password'}
      inputClass={props.inputClass}
      className="relative"
      iconClassName="mt-[9px] !top-0 !translate-y-0 text-Gray-600 icon-wrapper w-6 h-6"
    />
  );
};

export default PasswordField;
