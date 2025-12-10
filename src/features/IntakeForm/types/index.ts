import type { CustomDatePickerProps } from '@/stories/Common/CustomDatePicker';
import type { InputFieldProps } from '@/stories/Common/Input';
import type { RadioFieldProps } from '@/stories/Common/RadioBox';
import type { SelectProps } from '@/stories/Common/Select';

import type { FieldValues } from 'react-hook-form';
import type { GroupBase } from 'react-select';
export interface FormField {
  field_id: string;
  field_name: string;
  label: string;
  field_type: string;
  description?: string;
  required: boolean;
  id: string;
  section_id: string;
  section_title?: string;
  field_error?: string;
  ordinal_id: string;
  field_value?: string;
  selected_value?:
    | string
    | { value: string; label: string }
    | { value: string; label: string }[]
    // Allow nested/mixed option shapes that may occur from upstream values
    | {
        value: { value: string; label: string } | string;
        label: { value: string; label: string } | string;
      }[];
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  max_length?: number;
  default_value?: string;
  options?: string[];
  fields?: FormField[];
  // Additional properties used in the implementation
  name?: string;
  ordinal?: string;
  value?: string;
}

export interface FormSection {
  section_id: string;
  section_title: string;
  description?: string;
  fields: FormField[];
}

export interface FormStructure {
  form_title: string;
  form_name: string; // Added to match code usage
  form_description: string;
  sections: FormSection[];
  metadata: {
    template_id: string;
  };
}

export type CheckboxFieldProps = {
  id: string;
  label?: string | React.ReactNode;
  isChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  labelPlacement?: 'start' | 'end';
  name?: string;
  value?: string | boolean;
  isDefaultChecked?: boolean;
  labelClass?: string;
  parentClassName?: string;
  isDisabled?: boolean;
};

export type TextAreaFieldProps = {
  label?: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  className?: string;
  name?: string;
  parentClassName?: string;
  labelClass?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
  value?: string;
  style?: React.CSSProperties;
};

type NumberFieldProps = Omit<InputFieldProps<FieldValues>, 'type'>;

export type TimeSelectFieldProps = {
  label?: string;
  parentClassName?: string;
  placeholder?: string;
  value?: Date | null | string;
  onChange?: (time: string) => void;
  labelClassName?: string;
  className?: string;
  timeIntervals?: number;
  error?: string;
  errorClass?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  name?: string;
  isRequired?: boolean;
  isLoading?: boolean;
};

export type FileUploadFieldProps = {
  multiple?: boolean;
  handelSubmit: (
    files: Array<{
      id: string;
      file?: File;
      name: string;
      url?: string;
      type: string;
      isExisting?: boolean;
    }>
  ) => void;
  accept?: string;
  NumberOfFileAllowed: number;
  noLimit?: boolean;
  className?: string;
  existingFiles?: Array<{
    id: string;
    file?: File;
    name: string;
    url?: string;
    type: string;
    isExisting?: boolean;
  }>;
  onFileRemove?: (fileId?: string) => void;
  isSubmitting?: boolean;
  autoUpload?: boolean;
};

type SelectFieldProps = SelectProps<
  FieldValues,
  { label: string; value: string },
  boolean,
  GroupBase<{ label: string; value: string }>
>;

// Union type for all possible component props
export type ComponentProps =
  | CustomDatePickerProps
  | CheckboxFieldProps
  | SelectFieldProps
  | TextAreaFieldProps
  | NumberFieldProps
  | TimeSelectFieldProps
  | FileUploadFieldProps
  | RadioFieldProps;

// Union type for all possible onChange values
export type OnChangeValue =
  | string
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>
  | Date
  | { value: string; label: string };

export type AllowedChangeValue =
  | string
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>
  | Date
  | { value: string; label: string }
  | { value: string; label: string }[]
  | string[]
  | undefined;
