import React, { useEffect, useState } from 'react';

import { useForm, useFieldArray } from 'react-hook-form';

import { ASSESSMENT_QUESTION_OPTIONS } from '@/constants/CommonConstant';
import { QuestionTypeEnum } from '@/enums';
import OptionsManager from '@/features/admin/components/DynamicFormBuilder/components/OptionsManager';
import type {
  DynamicQuestion,
  QuestionOption,
} from '@/features/admin/components/DynamicFormBuilder/types';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import Select from '@/stories/Common/Select';

interface EditQuestionModalProps {
  question: DynamicQuestion;
  onSave: (q: DynamicQuestion) => void;
  onClose: () => void;
  isOpen: boolean;
  allQuestions: DynamicQuestion[];
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  question,
  onSave,
  onClose,
  isOpen,
  allQuestions,
}) => {
  const { control, register, handleSubmit, watch, setValue, getValues } = useForm<DynamicQuestion>({
    defaultValues: question,
  });

  const [isQuestionDependent, setIsQuestionDependent] = useState<boolean>(false);
  const [dependentQuestionId, setDependentQuestionId] = useState<string | null>(null);
  const [dependentOption, setDependentOption] = useState<QuestionOption | null>(null);
  const [optionsAvailable, setOptionsAvailable] = useState([]);

  useEffect(() => {
    if (question.metadata?.dependent_on?.question_number) {
      setIsQuestionDependent(true);
      const parentQuestion = allQuestions.at(question.metadata?.dependent_on?.question_number);
      setDependentQuestionId(parentQuestion?.id);
      setOptionsAvailable(
        parentQuestion.options.map(ops => {
          return { label: ops.option_text, value: ops.option_value };
        })
      );
      setDependentOption(question.metadata.dependent_on.option_value);
    }
  }, [question]);

  const getQuestionKey = (q: DynamicQuestion) => q.id ?? q.uid;

  const { fields: options } = useFieldArray({
    control,
    name: 'options',
  });

  const questionType = watch('question_type');

  const handleSave = handleSubmit(data => {
    if (isQuestionDependent && dependentQuestionId && dependentOption) {
      data.metadata = {
        ...data.metadata,
        dependent_on: {
          question_number: allQuestions.findIndex(
            question => getQuestionKey(question) == dependentQuestionId
          ),
          option_value: dependentOption,
        },
      };
    } else {
      data.metadata = { ...data.metadata, dependent_on: null };
    }

    onSave(data);
  });
  const mappedQuestionOption = allQuestions.map(q => ({
    opt: q.options,
    label: q.question_text,
    value: getQuestionKey(q),
  }));

  return (
    // Updated Modal
    <Modal
      size='xl'
      onClose={onClose}
      isOpen={isOpen}
      title='Edit Question'
      parentTitleClassName='!p-5'
      footerClassName='!p-5'
      contentClassName='!p-5'
      closeButton={false}
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button variant='outline' title='Cancel' onClick={onClose} className='!px-8 rounded-lg' />
          <Button variant='filled' title='Save' onClick={handleSave} className='!px-8 rounded-lg' />
        </div>
      }
    >
      <div className='w-full flex flex-col gap-5'>
        <InputField
          label='Question Text'
          isRequired
          labelClass='!text-base !leading-5'
          inputClass='!text-base !leading-5 !border-surfacedark'
          type='text'
          {...register('question_text')}
        />
        <Select
          label='Question Type'
          isRequired
          labelClassName='!text-base !leading-5'
          options={ASSESSMENT_QUESTION_OPTIONS}
          {...register('question_type')}
          value={ASSESSMENT_QUESTION_OPTIONS.find(
            option => option.value == getValues('question_type')
          )}
          onChange={value => {
            setValue('question_type', value?.value);
          }}
          isDisabled={true}
          StylesConfig={{
            control: () => ({
              minHeight: '50px',
              borderColor: '#DDE1E8',
              border: '1px solid #DDE1E8',
            }),
            singleValue: () => ({
              fontSize: '16px',
            }),
            option: () => ({
              fontSize: '16px',
            }),
          }}
        />

        {[QuestionTypeEnum.SHORT_ANSWER].includes(questionType) && (
          <InputField
            label='Placeholder'
            labelClass='!text-base !leading-5'
            type='text'
            {...register('placeholder')}
            inputClass='!text-base !leading-5 !border-surfacedark'
          />
        )}

        {/* Required */}
        <div className='inline-block'>
          <CheckboxField
            id={`required-${question.uid}`}
            isChecked={watch('is_required')}
            onChange={e => setValue('is_required', e.target.checked)}
            label='Required'
            labelClass='!text-base !leading-5'
          />
        </div>

        {[
          QuestionTypeEnum.RADIO,
          QuestionTypeEnum.SINGLE_CHOICE,
          QuestionTypeEnum.MULTIPLE_CHOICE,
          QuestionTypeEnum.CHECKBOX,
        ].includes(questionType) && (
          <OptionsManager
            options={options}
            onUpdate={opts => setValue('options', opts)}
            questionType={questionType}
          />
        )}
        <div className='inline-block'>
          <CheckboxField
            id={`isDependent-${question.uid}`}
            isChecked={isQuestionDependent}
            onChange={e => setIsQuestionDependent(e.target.checked)}
            label='Is field dependent?'
            labelClass='!text-base !leading-5 whitespace-nowrap'
          />
        </div>
        {isQuestionDependent && (
          <div className='flex flex-col gap-5'>
            <Select
              label='Dependent Question'
              isRequired
              labelClassName='!text-base !leading-5'
              options={mappedQuestionOption}
              value={mappedQuestionOption.find(q => q.value == dependentQuestionId)}
              onChange={value => {
                setDependentQuestionId(value?.value || null);
                setDependentOption(null); // reset selected option
                setOptionsAvailable(
                  value.opt.map(ops => {
                    return { label: ops.option_text, value: ops.option_value };
                  })
                );
              }}
              StylesConfig={{
                control: () => ({
                  minHeight: '50px',
                  borderColor: '#DDE1E8',
                  border: '1px solid #DDE1E8',
                }),
                singleValue: () => ({
                  fontSize: '16px',
                }),
                option: () => ({
                  fontSize: '16px',
                }),
              }}
            />

            {dependentQuestionId && (
              <Select
                label='Dependent Option'
                isRequired
                labelClassName='!text-base !leading-5'
                options={optionsAvailable}
                value={optionsAvailable.find(opt => opt.value == dependentOption)}
                onChange={value => {
                  setDependentOption(value.value);
                }}
                StylesConfig={{
                  control: () => ({
                    minHeight: '50px',
                    borderColor: '#DDE1E8',
                    border: '1px solid #DDE1E8',
                  }),
                  singleValue: () => ({
                    fontSize: '16px',
                  }),
                  option: () => ({
                    fontSize: '16px',
                  }),
                }}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditQuestionModal;
