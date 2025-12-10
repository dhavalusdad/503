import { useState, type ChangeEventHandler, type InputHTMLAttributes } from 'react';

import clsx from 'clsx';

import type { IconNameType } from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';

import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';

interface PasswordFieldProps<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  name?: Path<T>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  label?: string;
  labelClass?: string;
  inputClass?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  parentClassName?: string;
  register?: UseFormRegister<T>;
  icon?: IconNameType;
  iconFirst?: boolean;
  error?: string;
  value?: string | number | undefined;
}

export const PasswordField = <T extends FieldValues>(
  props: Omit<PasswordFieldProps<T>, 'type'>
) => {
  const [show, setShow] = useState(false);

  return (
    <div className='relative'>
      <InputField
        {...props}
        type={show ? 'text' : 'password'}
        autoComplete={props.autoComplete || 'new-password'}
        inputClass={clsx(props.inputClass, '!border-primarylight')}
        className='relative'
        viewPasswordIcon={true}
        setShow={setShow}
        show={show}
      />
    </div>
  );
};

export default PasswordField;
