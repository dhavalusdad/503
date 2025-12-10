import React, { useState, useEffect } from 'react';

import clsx from 'clsx';
import moment from 'moment';

import { selectStyles } from '@/constants/CommonConstant';
import AmdSimpleIcdCptSelector from '@/stories/Common/AmdICDCPTselector/SimpleAmdIcdCptSelector';
import CheckboxField from '@/stories/Common/CheckBox';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import FileUpload from '@/stories/Common/FileUpload';
import InputField from '@/stories/Common/Input';
import { NumberField } from '@/stories/Common/NumberField';
import RadioField from '@/stories/Common/RadioBox';
import Select from '@/stories/Common/Select';
import TextArea from '@/stories/Common/Textarea';
import TimeSelect from '@/stories/Common/TimeSelect';

import type {
  AllowedChangeValue,
  ComponentProps,
  FormField,
  FormSection,
  FormStructure,
  OnChangeValue,
} from '../types';

export const useJsonToHtmlForm = (
  formStructure: FormStructure,
  updateFormData: FormField[]
): {
  formData: FormStructure;
  generateFormSections: () => React.ReactNode[] | false;
  resetForm: () => void;
  validateForm: () => boolean;
} => {
  const [formData, setFormData] = useState<FormStructure>({
    ...formStructure,
  } as FormStructure);

  // Handle form value changes
  const handleFieldChange = (
    field: FormField,
    value: AllowedChangeValue | undefined | { code: string; description: string }[]
  ) => {
    if (value !== '-1') {
      if (
        (field.field_id == 'dsm_icd_dx' || field.label == 'DSM V/ ICD-10 Dx:') &&
        Array.isArray(value)
      ) {
        let dsm_icd_string = '';
        if (Array.isArray(value)) {
          value.map(d => {
            dsm_icd_string = `${dsm_icd_string}${d?.code} ${d?.description} ,,`;
          });
        }
        field.field_value = (field?.field_value || '') + dsm_icd_string.replaceAll(',,', `\n`);
      } else {
        if (field.field_type === 'select' || field.field_type === 'multiselect') {
          if (field.field_type === 'multiselect') {
            if (Array.isArray(value)) {
              field.field_value = value.join(',');
              field.selected_value =
                value?.length > 0 ? value.map(d => ({ value: d, label: d })) : [];
            } else if (typeof value === 'string') {
              const parts = value.split(',');
              field.field_value = value;
              field.selected_value =
                value.length > 0 ? parts.map(d => ({ value: d, label: d })) : [];
            }
            field.field_error = '';
          } else {
            field.field_value =
              typeof value === 'object' && 'value' in value
                ? (value.value as string)
                : (value as string);
            field.selected_value =
              typeof value === 'object' && 'value' in value
                ? (value as { value: string; label: string })
                : { value: value as string, label: value as string };
            field.field_error = '';
          }
        } else if (field.field_type === 'radio') {
          field.field_value = value === 'Yes' ? '0' : '1';
          field.selected_value = value as string;
        } else if (field.field_type === 'checkbox') {
          field.field_value = value as string;
          field.field_error = '';
        } else {
          field.field_value = value as string;
          field.field_error = '';
        }
      }

      setFormData({ ...formData });
    }
  };

  const validateForm = () => {
    let isValid = true;
    formData.sections.forEach((section: FormSection) => {
      section.fields.forEach((field: FormField) => {
        if (field.section_id) {
          field.fields?.forEach((subField: FormField) => {
            if (subField.field_name && subField.ordinal_id) {
              if (!subField.field_value) {
                subField.field_error = `${subField.label} is Required`;
                isValid = false;
              }
            }
          });
        } else {
          if (field.field_name && field.ordinal_id) {
            if (!field.field_value) {
              field.field_error = `${field.label} is Required`;
              isValid = false;
            }
          }
        }
      });
    });
    setFormData({ ...formData });
    return isValid;
  };

  const resetForm = () => setFormData({} as FormStructure);

  // Generate form sections
  const generateFormSections = () => {
    return (
      Array.isArray(formStructure?.sections) &&
      formStructure.sections.map(section => generateSection(section, handleFieldChange, false))
    );
  };

  useEffect(() => {
    if (formStructure?.form_title) {
      setFormData({ ...formStructure } as FormStructure);

      if (updateFormData) {
        handleUpdateFormData();
      }
    }
  }, [formStructure, updateFormData]);

  const getField = (field: FormField) => {
    if (field.ordinal_id) {
      return updateFormData?.find(
        (subField: FormField) =>
          subField.name === field.field_name && subField.ordinal === field.ordinal_id
      );
    } else {
      return field;
    }
  };

  const handleUpdateFormData = () => {
    formStructure.sections.forEach((section: FormSection) => {
      section.fields.forEach((field: FormField) => {
        if (field.section_id) {
          field.fields?.forEach((subField: FormField) => {
            if (subField.field_name && subField.ordinal_id) {
              const field = getField(subField);
              if (field && field.value !== '-1') {
                handleFieldChange(subField, field.value);
              }
            }
          });
        } else {
          if (field.field_name && field.ordinal_id) {
            const fieldValue = getField(field);
            if (fieldValue && fieldValue.value !== '-1') {
              handleFieldChange(field, fieldValue.value);
            }
          }
        }
      });
    });
  };

  return {
    formData,
    generateFormSections,
    resetForm,
    validateForm,
  };
};

// Generate a form section
const generateSection = (
  section: FormSection | FormField,
  onChange: (
    field: FormField,
    value: AllowedChangeValue | undefined | { code: string; description: string }[]
  ) => void,
  isChild: boolean
): React.ReactNode => {
  const sectionId = section.section_id;
  const sectionTitle =
    'section_title' in section ? section.section_title : section.section_title || '';
  const sectionDescription = section.description;
  const sectionFields = ('fields' in section ? section.fields : section.fields) || [];

  const sectionProps = {
    key: sectionId,
    id: sectionId,
    className: !isChild ? 'form-section p-5 border border-surface rounded-lg bg-white' : '',
    'data-section-id': sectionId,
  };

  const titleProps = {
    key: `${sectionId}-title`,
    id: `${sectionId}-title`,
    className: 'text-xl font-bold text-blackdark mb-2',
  };

  const descriptionProps = {
    key: `${sectionId}-desc`,
    className: 'text-blackdark text-base mb-5',
  };

  const fieldsContainerProps = {
    key: `${sectionId}-fields`,
    className: 'flex flex-col gap-5',
  };

  return React.createElement(
    'div',
    sectionProps,
    [
      // Section title
      React.createElement('h2', titleProps, sectionTitle),

      // Section description
      sectionDescription && React.createElement('p', descriptionProps, sectionDescription),

      // Section fields
      React.createElement(
        'div',
        fieldsContainerProps,
        sectionFields.map(field =>
          field?.section_id
            ? generateSection(field, onChange, true)
            : generateField(field, onChange)
        )
      ),
    ].filter(Boolean)
  );
};

// Generate a form field
const generateField = (
  field: FormField,
  onChange: (
    field: FormField,
    value: AllowedChangeValue | undefined | { code: string; description: string }[]
  ) => void
): React.ReactNode => {
  // Map field types to components
  const fieldTypeMapping: Record<
    string,
    {
      element: React.ComponentType<ComponentProps>;
      action: (value: OnChangeValue) => void;
    }
  > = {
    checkbox: {
      element: CheckboxField as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (value && typeof value === 'object' && 'target' in value) {
          const e = value as React.ChangeEvent<HTMLInputElement>;
          onChange(field, e.target.checked ? '1' : '0');
        }
      },
    },
    text: {
      element: InputField as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (value && typeof value === 'object' && 'target' in value) {
          const e = value as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(field, e.target.value);
        }
      },
    },
    textarea: {
      element: TextArea as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (value && typeof value === 'object' && 'target' in value) {
          const e = value as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(field, e.target.value);
        }
      },
    },
    select: {
      element: Select as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        onChange(field, value);
      },
    },
    multiselect: {
      element: Select as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (Array.isArray(value)) {
          onChange(
            field,
            value.map(d => d.value)
          );
        }
      },
    },

    date: {
      element: CustomDatePicker as React.ComponentType<ComponentProps>,
      action: () => {},
    },
    number: {
      element: NumberField as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (typeof value === 'string') {
          onChange(field, value);
        }
      },
    },
    radio: {
      element: RadioField as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (typeof value === 'string') {
          onChange(field, value);
        }
      },
    },
    file: {
      element: FileUpload as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (typeof value === 'string') {
          onChange(field, value);
        }
      },
    },
    time: {
      element: TimeSelect as React.ComponentType<ComponentProps>,
      action: (value: OnChangeValue) => {
        if (typeof value === 'string') {
          onChange(field, value);
        }
      },
    },
  };

  const Component = fieldTypeMapping[field.field_type]?.element || TextArea;
  const action = fieldTypeMapping[field.field_type]?.action;

  // Base props for all fields
  const baseProps = {
    key: field.field_name,
    id: `${field.field_name}-${field.ordinal_id}`,
    name: field.field_name,
    label: field.label,
    labelClassName: 'font-normal leading-5 whitespace-nowrap !w-full',
    value:
      field.field_type === 'select' ||
      field.field_type === 'multiselect' ||
      field.field_type == 'radio'
        ? field.selected_value
        : field.field_value,
    required: field.required,
    error: !!field.field_error,
    errorMessage: field.field_error,

    onChange: action,
    'data-field-id': field.field_id,
    'data-ordinal': field.ordinal_id,
    style: field.position
      ? {
          position: 'relative',
          minWidth: field.position.width > 0 ? `${field.position.width}px` : '100%',
          height:
            field.position.height > 0
              ? `${field.position.height < 34 ? 50 : field.position.height}px`
              : 'auto',
        }
      : undefined,
    className: clsx(
      `form-field ${field.field_error ? 'error' : ''} ${field.required ? 'required' : ''} ${field.field_type == 'text' || field.field_type == 'textarea' ? `h-[${field.position?.height}px]` : ''}  `
    ),
  };

  let specificProps = {};

  switch (field.field_type) {
    case 'checkbox':
      specificProps = {
        isChecked: Boolean(Number(field?.field_value)),
        labelClass: 'font-normal !leading-5 !text-base',
        parentClassName: 'w-full items-start',
      };
      break;

    case 'select':
    case 'multiselect':
      specificProps = {
        options: field.options?.map(opt => ({ label: opt, value: opt })) || [],
        isMulti: field.field_type === 'multiselect',
        StylesConfig: selectStyles,
        maxSelectedToShow: 10,
        parentClassName: 'w-full',
        labelClassName: '!text-base !leading-5',
      };
      break;

    case 'textarea':
    case 'number':
      specificProps = {
        maxLength: field.max_length,
        rows: Math.min(Math.max(Math.floor((field.position?.height || 24) / 20), 2), 6),
        placeholder: field.required ? `${field.label} (Required)` : field.label,
        style: {
          width: '100%',
          height:
            field.position?.height && field.position.height > 80
              ? `${field.position.height}px`
              : 80,
        },
        parentClassName: 'w-full',
        labelClass: '!text-base !leading-5',
        className: '!text-base !leading-5',
      };
      break;

    case 'text':
      specificProps = {
        maxLength: field.max_length,
        rows: Math.min(Math.max(Math.floor((field.position?.height || 24) / 20), 2), 6),
        placeholder: field.required ? `${field.label} (Required)` : field.label,
        style: {
          width: '100%',
          height:
            field.position?.height && field.position.height > 80
              ? `${field.position.height}px`
              : 50,
        },
        parentClassName: 'w-full',
        labelClass: '!text-base !leading-5',
        inputClass: '!text-base !leading-5',
      };
      break;

    case 'date':
      specificProps = {
        id: `${field.field_name}-${field.ordinal_id}`,
        selected: field.field_value ? moment(field.field_value).toDate() : '',
        onChange: (value: Date | null) => {
          if (value instanceof Date) {
            const dateValue = moment(value).format('YYYY-MM-DD');
            onChange(field, dateValue as string);
          }
        },
        label: field.label,
        dateFormat: 'dd/MM/yyyy',
        className: 'bg-white text-base !p-3',
      };
      break;

    case 'radio':
      specificProps = {
        options:
          field.options?.map(opt => ({
            label: opt,
            value: opt,
          })) || [],
        onChange: (val: string) => {
          onChange(field, val);
        },
        parentClassName: 'w-full items-start',
      };
      break;
  }

  const wrapperProps = {
    key: `${field.field_name}-wrapper`,
    className: `field-wrapper ${field.field_type}-field grid`,
    style: field.position
      ? {
          position: 'relative' as const,
          minWidth: '100%',
        }
      : undefined,
  };

  const descriptionProps = {
    key: `${field.field_name}-desc`,
    className: 'text-blackdark mb-4 text-base font-semibold',
  };

  const errorProps = {
    key: `${field.field_name}-error`,
    className: 'error-message text-red-500 text-sm mt-1 block',
  };

  const componentProps =
    field.field_type === 'date' ? { ...specificProps } : { ...baseProps, ...specificProps };

  let customComponent = null;
  if (field.field_id === 'dsm_icd_dx' || field.label == 'DSM V/ ICD-10 Dx:') {
    customComponent = React.createElement(
      'div',
      { className: 'flex flex-col gap-2' },
      React.createElement(
        Component as React.ComponentType<ComponentProps>,
        componentProps as ComponentProps
      ),
      React.createElement(AmdSimpleIcdCptSelector, {
        onChange: data => {
          const dataList =
            Object.values(data)
              .flat()
              .map(d => {
                return {
                  code: d.chargeCode || d.code || d.diagnosisCode,
                  description: d.diagnosisDescription || d.description,
                };
              }) || [];
          onChange(field, dataList);
        },
      })
    );
  }

  return React.createElement(
    'div',
    wrapperProps,
    [
      // Field description
      field?.description && React.createElement('p', descriptionProps, field?.description),

      // Field component
      customComponent
        ? customComponent
        : React.createElement(
            Component as React.ComponentType<ComponentProps>,
            componentProps as ComponentProps
          ),

      // Error message
      !!field?.field_error && React.createElement('span', errorProps, field?.field_error),
    ].filter(Boolean)
  );
};
