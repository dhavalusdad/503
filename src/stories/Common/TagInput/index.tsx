import React, { useCallback } from 'react';

import clsx from 'clsx';

import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';

export interface TagInputProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  isDuplicate?: boolean;
  placeholder?: string;
  name?: string;
  initialTags?: string[] | undefined;
  className?: string;
  errors?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  isDuplicate = false,
  placeholder = '',
  className = '',
  errors = '',
  name,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      const value = e.currentTarget.value.trim();
      e.preventDefault();
      const isDuplicateAllowed = isDuplicate || !tags.includes(value);
      if (value && isDuplicateAllowed) {
        onAdd(value);
      }
      return (e.currentTarget.value = '');
    },
    [tags, onAdd, isDuplicate]
  );

  return (
    <>
      <div
        className={clsx(
          `flex flex-wrap gap-2  w-full p-3.5 border border-solid border-primarylight rounded-10px text-sm text-blackdark placeholder:text-primarygray focus:outline-1 focus:outline-primary transition-all ease-in-out duration-300`,
          className,
          {
            'border-red-500': errors,
          }
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className='inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-md text-sm'
          >
            {tag}
            <Button
              variant='none'
              icon={<Icon name='close' />}
              isIconFirst={true}
              onClick={() => onRemove(tag)}
              className='text-white hover:text-gray-300 p-2'
              type='button'
              aria-label={`Remove ${tag}`}
            />
          </span>
        ))}
        <InputField
          type='text'
          inputParentClassName='border-none focus:outline-none flex-grow'
          inputClass='!border-none focus:outline-none flex-grow !w-[400px]'
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          name={name}
          data-testid='tag-input'
        />
      </div>
      {errors && <p className='text-red-500 text-xs mt-2'>{errors}</p>}
    </>
  );
};

export default TagInput;
