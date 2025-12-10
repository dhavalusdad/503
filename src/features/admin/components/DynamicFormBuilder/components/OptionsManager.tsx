import React, { useEffect, useState } from 'react';

import { QuestionTypeEnum } from '@/enums';
import {
  type QuestionOption,
  type QuestionType,
} from '@/features/admin/components/DynamicFormBuilder/types';
import Button from '@/stories/Common/Button';
import InputField from '@/stories/Common/Input';

interface OptionsManagerProps {
  options: QuestionOption[];
  onUpdate: (options: QuestionOption[]) => void;
  questionType: QuestionType;
}

const OptionsManager: React.FC<OptionsManagerProps> = ({ options, onUpdate, questionType }) => {
  const [newOption, setNewOption] = useState({ value: '', option_text: '' });
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options); // keep in sync if parent changes externally
  }, [options]);

  const addOption = () => {
    if (newOption.option_text.trim()) {
      const value = newOption.option_text
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      const option: QuestionOption = {
        uid: Date.now().toString(),
        option_value: value,
        option_text: newOption.option_text.trim(),
        order_index: options.length + 1,
      };
      onUpdate([...options, option]);
      setLocalOptions([...options, option]);
      setNewOption({ value: '', option_text: '' });
    }
  };

  // helper for consistency
  const getOptionKey = (o: { id?: string | number; uid?: string }) => o.id?.toString() ?? o.uid;

  const updateOption = (optionId: string, field: 'value' | 'option_text', value: string) => {
    setLocalOptions(prev =>
      prev.map(option =>
        getOptionKey(option) === optionId ? { ...option, [field]: value } : option
      )
    );
  };

  const handleBlur = () => {
    onUpdate(localOptions);
  };

  // const removeOption = (optionId: string) => {
  //   const updatedOptions = options.filter(option => getOptionKey(option) !== optionId);
  //   onUpdate(updatedOptions);
  // };

  // const moveOption = (optionId: string, direction: 'up' | 'down') => {
  //   const currentIndex = options.findIndex(option => getOptionKey(option) === optionId);
  //   if (
  //     (direction === 'up' && currentIndex > 0) ||
  //     (direction === 'down' && currentIndex < options.length - 1)
  //   ) {
  //     const newOptions = [...options];
  //     const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  //     // swap positions
  //     [newOptions[currentIndex], newOptions[targetIndex]] = [
  //       newOptions[targetIndex],
  //       newOptions[currentIndex],
  //     ];

  //     // update order_index after swap
  //     const reIndexed = newOptions.map((opt, idx) => ({
  //       ...opt,
  //       order_index: idx,
  //     }));

  //     onUpdate(reIndexed);
  //   }
  // };

  if (
    ![
      QuestionTypeEnum.RADIO,
      QuestionTypeEnum.SINGLE_CHOICE,
      QuestionTypeEnum.MULTIPLE_CHOICE,
      QuestionTypeEnum.CHECKBOX,
    ].includes(questionType)
  ) {
    return null;
  }

  return (
    <div className='p-5 rounded-10px bg-Graylightdark'>
      <h4 className='text-base font-normal text-blackdarklight leading-5 mb-2'>
        Options for {questionType === 'radio' ? 'Radio' : 'Select'} Question
      </h4>

      <div className='border border-solid border-surface p-5 rounded-10px'>
        <div className='grid grid-cols-2 gap-x-2.5 gap-y-5'>
          {options.map((option, index) => {
            const qKey = option.uid ?? option.id?.toString();

            return (
              <div key={qKey} className='w-full'>
                {/* <InputField
                  type='text'
                  placeholder='Option value'
                  value={option.option_value}
                  onChange={e => updateOption(qKey, 'value', e.target.value)}
                  className='text-sm'
                /> */}

                <InputField
                  type='text'
                  placeholder='Option label'
                  label={`Option ${index + 1}`}
                  labelClass='!text-base !leading-5'
                  inputClass='!text-base !leading-5 !border-surfacedark'
                  value={localOptions[index].option_text}
                  onChange={e => updateOption(qKey, 'option_text', e.target.value)}
                  parentClassName='w-full'
                  onBlur={handleBlur}
                />
                {/* <Button
                  variant='none'
                  icon={<Icon name='dropdownUpArrow' />}
                  onClick={() => moveOption(qKey, 'up')}
                  isDisabled={index === 0}
                  className='p-1'
                />
                <Button
                  variant='none'
                  icon={<Icon name='dropDown' />}
                  onClick={() => moveOption(qKey, 'down')}
                  isDisabled={index === options.length - 1}
                  className='p-1'
                /> */}
                {/* <Button
                  variant='none'
                  icon={<Icon name='delete' />}
                  onClick={() => removeOption(qKey)}
                  className='p-1 text-red-500 hover:text-red-700'
                /> */}
              </div>
            );
          })}
        </div>
      </div>

      <div className='mt-5 flex items-center gap-2.5'>
        {/* <InputField
          type='text'
          placeholder='Option value'
          value={newOption.value}
          onChange={e => setNewOption({ ...newOption, value: e.target.value })}
          className='flex-1'
        /> */}
        <InputField
          type='text'
          placeholder='Option label'
          value={newOption.option_text}
          onChange={e => setNewOption({ ...newOption, option_text: e.target.value })}
          parentClassName='w-full'
          inputClass='!text-base !leading-5 !border-surfacedark'
        />
        <Button
          variant='filled'
          title='Add Option'
          onClick={addOption}
          isDisabled={!newOption.option_text.trim()}
          className='!p-4 whitespace-nowrap rounded-10px'
        />
      </div>

      {options.length === 0 && (
        <p className='text-base text-blackdark text-center py-4'>
          No options added yet. Add at least one option for this question type.
        </p>
      )}
    </div>
  );
};

export default OptionsManager;
