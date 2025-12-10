import { type JSX } from 'react';

import { InputField, type InputFieldProps } from '@/stories/Common/Input';

import type { FieldValues } from 'react-hook-form';

export const NumberField = <TFormValues extends FieldValues>(
  props: Omit<InputFieldProps<TFormValues>, 'type'>
): JSX.Element => {
  return (
    <InputField
      {...props}
      type='text'
      onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
      }}
    />
  );
};
