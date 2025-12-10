import { useState } from 'react';

import clsx from 'clsx';
import ReactQuill from 'react-quill-new';

import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';

import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps<TFormValues extends FieldValues> {
  value?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  isShowToolbar?: boolean;
  isAllowFormatting?: boolean;
  className?: string;
  name?: Path<TFormValues>;
  register?: UseFormRegister<TFormValues>;
  label?: string;
  labelClassName?: string;
  error?: string;
  errorClass?: string;
  theme?: 'snow' | 'bubble' | '';
  editorContainerClass?: string;
  toolbarClass?: string;
  isRequired?: boolean;
  parentClassName?: string;
}

export const RichTextEditorField = <TFormValues extends Record<string, unknown>>(
  fieldProps: RichTextEditorProps<TFormValues>
) => {
  const {
    value = '',
    onChange,
    isDisabled = false,
    placeholder = 'Start writing here...',
    isShowToolbar = true,
    isAllowFormatting = true,
    className,
    label,
    labelClassName,
    error,
    errorClass,
    theme,
    parentClassName,
    isRequired = false,
  } = fieldProps;
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const modules = {
    toolbar: isShowToolbar
      ? isAllowFormatting
        ? [
            ['bold', 'italic', 'underline', 'strike'], // Bold, italic, underline, strike
            [{ size: ['large', 'small', false, 'huge'] }], // Font size
            // [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers
            // [{ color: [] }, { background: [] }], // Text and background color
            [{ list: 'ordered' }, { list: 'bullet' }], // Lists
            [{ indent: '-1' }, { indent: '+1' }], // Indentation
            // [{ align: [] }] // Text alignment
          ]
        : [] // Empty toolbar when formatting is disabled
      : false, // Hide toolbar completely if `showToolbar` is false
  };
  const formats = isAllowFormatting
    ? [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'script',
        'list',
        // 'bullet',
        'indent',
        'align',
        'blockquote',
        'code-block',
        'link',
        'image',
        'video',
      ]
    : []; // Disable all formats when `allowFormatting` is false

  return (
    <div className={clsx('relative  w-full', parentClassName)}>
      <div className='relative flex flex-col gap-2.5'>
        {label && (
          <label className={clsx('text-base text-blackdark font-normal leading-5', labelClassName)}>
            {label}{' '}
            {isRequired && <span className='text-red font-bold text-base leading-5'>*</span>}
          </label>
        )}
        <ReactQuill
          value={value}
          theme={theme ?? 'snow'}
          className={clsx(
            'rich-text-editor',
            className,
            {
              focused: hasFocus && !isDisabled,
            },
            error && 'description-error'
          )}
          onChange={onChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          modules={modules}
          formats={formats}
          readOnly={isDisabled}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <p className={clsx('helper__text text-red-500 text-xs mt-1.5', errorClass)}>{error}</p>
      )}
    </div>
  );
};

export default RichTextEditorField;
