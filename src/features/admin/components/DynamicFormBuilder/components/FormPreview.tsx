import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';

import moment from 'moment';

import { useUploadFormFile } from '@/api/assessment-forms';
import { QuestionTypeEnum } from '@/enums';
import { useDeviceType } from '@/hooks/useDeviceType';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import FileUpload, { type FileItem } from '@/stories/Common/FileUpload';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import MediaViewerModal from '@/stories/Common/MediaViewerModal';
import { NumberField } from '@/stories/Common/NumberField';
import RadioField from '@/stories/Common/RadioBox';
import Select from '@/stories/Common/Select';
import Spinner from '@/stories/Common/Spinner';
import TextArea from '@/stories/Common/Textarea';

import {
  type FormPreviewProps,
  type DynamicQuestion,
  type DynamicForm,
  type ValueType,
  type QuestionOption,
  type LabelValue,
} from '../types';

// Utility function to get unique key for questions/options
const getQuestionKey = (q: DynamicQuestion | QuestionOption): string => q.id?.toString() ?? q.uid;

const SERVER_URL = import.meta.env.VITE_BASE_URL;

// Question renderer component
export const QuestionRenderer: React.FC<{
  question: DynamicQuestion;
  answer: ValueType;
  readOnly: boolean;
  onAnswerChange: (value: ValueType, inputField?: boolean) => void;
}> = ({ question, answer, readOnly, onAnswerChange }) => {
  const deviceType = useDeviceType();
  const options = useMemo(
    () =>
      question.options?.map(opt => ({
        value: opt.option_value,
        label: opt.option_text,
      })),
    [question.options]
  );

  switch (question.question_type) {
    case QuestionTypeEnum.SHORT_ANSWER:
      return (
        <InputField
          type='text'
          value={answer as string}
          onChange={e => onAnswerChange(e.target.value)}
          placeholder={question.placeholder || 'Enter your answer...'}
          isDisabled={readOnly}
          inputClass='bg-Graylight !text-sm sm:!text-base !leading-5'
          parentClassName='w-full'
        />
      );

    case QuestionTypeEnum.LONG_ANSWER:
      return (
        <TextArea
          name={getQuestionKey(question)}
          onChange={e => onAnswerChange(e.target.value)}
          placeholder={question.placeholder || 'Enter your answer...'}
          rows={4}
          isDisabled={readOnly}
          className='w-full bg-Graylight !text-sm sm:!text-base !leading-5'
          parentClassName='w-full'
          value={answer as string}
        />
      );

    case QuestionTypeEnum.RADIO:
      return (
        <div className='flex flex-col gap-2'>
          {question.options?.map(option => {
            const isChecked =
              typeof answer === 'object' && answer !== null
                ? 'option_value' in answer
                  ? answer.option_value === option.option_value
                  : 'value' in answer
                    ? answer.value === option.option_value
                    : false
                : answer === option.option_value;

            return (
              <div key={option?.id}>
                <RadioField
                  isChecked={isChecked}
                  id={question.question_text}
                  label={option.option_text}
                  name={question.question_text}
                  isDisabled={readOnly}
                  value={option.option_value}
                  onChange={() => onAnswerChange(option, true)}
                  labelClass='!text-sm sm:!text-base'
                />
              </div>
            );
          })}
          {(!question.options || question.options.length === 0) && (
            <p className='text-sm text-gray-400 italic'>No options available</p>
          )}
        </div>
      );

    case QuestionTypeEnum.SINGLE_CHOICE:
    case QuestionTypeEnum.MULTIPLE_CHOICE: {
      const isMulti = question.question_type === QuestionTypeEnum.MULTIPLE_CHOICE;

      // Handle answer value - it could be an object, array, or primitive
      let currentValue;
      if (isMulti) {
        // For multiple choice, answer could be array of objects or array of values
        const answerArray = Array.isArray(answer) ? (answer as LabelValue[]) : [];
        currentValue =
          options?.filter(opt => {
            return answerArray.some(a => {
              const val = typeof a === 'object' && a !== null ? a.value : a;
              return val === opt.value;
            });
          }) || [];
      } else {
        // For single choice, answer could be object with value property or direct value
        const answerValue =
          typeof answer === 'string' || answer === null
            ? answer
            : typeof answer === 'object' && answer !== null
              ? 'value' in answer
                ? answer.value
                : 'option_value' in answer
                  ? answer.option_value
                  : null
              : null;

        currentValue = options?.find(opt => opt.value === answerValue) || null;
      }

      return (
        <Select
          options={options || []}
          isMulti={isMulti}
          value={currentValue}
          onChange={selected => onAnswerChange(selected as ValueType, true)}
          placeholder='Select an option...'
          isDisabled={readOnly}
          parentClassName='w-full'
          StylesConfig={{
            control: () => ({
              background: '#F9FAFB',
              minHeight: '50px',
            }),
            singleValue: () => ({
              fontSize: deviceType === 'mobile' ? '14px' : '16px',
            }),
            placeholder: () => ({
              fontSize: deviceType === 'mobile' ? '14px' : '16px',
            }),
            option: () => ({
              fontSize: deviceType === 'mobile' ? '14px' : '16px',
            }),
          }}
        />
      );
    }

    case QuestionTypeEnum.RATING:
      return (
        <InputField
          type='number'
          value={answer as string}
          placeholder={question.placeholder || 'Enter a number...'}
          disabled={readOnly}
          inputClass='bg-Graylight !text-sm sm:!text-base !leading-5'
          parentClassName='w-full'
        />
      );

    case QuestionTypeEnum.FILE_UPLOAD: {
      // Convert backend file objects to FileItem[]
      const existingFiles =
        Array.isArray(answer) && answer.length
          ? (answer as FileItem[]).map((file, index) => ({
              id: `existing-${index}`,
              name: file.name,
              url: file.url ? `${SERVER_URL}${file.url}` : '',
              file: file.file,
              type: file.type,
              isExisting: file.url ? true : false,
            }))
          : [];

      const [previewFiles, setPreviewFiles] = useState<FileItem[]>([]);

      return (
        <>
          <FileUpload
            NumberOfFileAllowed={1}
            multiple={false}
            accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
            className='w-full col-span-2 bg-Graylight'
            existingFiles={existingFiles}
            autoUpload={true}
            disabled={readOnly}
            canRemoveExisting={true}
            handelSubmit={files => {
              onAnswerChange(files);
            }}
            onFileClick={file => {
              setPreviewFiles([file]);
            }}
          />

          <MediaViewerModal
            isOpen={previewFiles.length > 0}
            files={previewFiles}
            onClose={() => setPreviewFiles([])}
          />
        </>
      );
    }

    case QuestionTypeEnum.CHECKBOX:
      return (
        <div>
          {question.options?.map(option => {
            const isChecked =
              Array.isArray(answer) &&
              (answer as LabelValue[]).some(v => v.value === option.option_value);

            return (
              <CheckboxField
                isChecked={isChecked}
                key={option?.id}
                id={`checkbox-${option.option_text}`}
                label={<p>{option.option_text}</p>}
                parentClassName='w-full'
                name={`checkbox-${option.option_text}`}
                value={option.option_value}
                isDisabled={readOnly}
                labelClass='!text-sm sm:!text-base'
                className='!border'
                onChange={event => {
                  const checked = event.target.checked;
                  const currentValues = (answer as LabelValue[]) || [];

                  const newValues = checked
                    ? [...currentValues, { label: option.option_text, value: option.option_value }]
                    : currentValues.filter(
                        (v: { label: string; value: string }) => v.value !== option.option_value
                      );

                  onAnswerChange(newValues);
                }}
              />
            );
          })}
        </div>
      );

    case QuestionTypeEnum.BULLET_POINTS:
      return (
        <ul className='list-disc pl-6 '>
          <li className='text-sm sm:text-base font-semibold text-blackdark'>
            {question.question_text}
          </li>
        </ul>
      );

    case QuestionTypeEnum.TEXT_HEADER:
      return (
        <h3 className='block text-sm sm:text-base text-blackdark font-semibold'>
          {question.question_text}
        </h3>
      );

    case QuestionTypeEnum.NUMERIC_INPUT:
      return (
        <NumberField
          label='Minimum Patient Age'
          value={answer as string}
          onChange={e => onAnswerChange(e.target.value)}
          placeholder={question.placeholder || 'Enter your answer...'}
          isDisabled={readOnly}
          labelClass='!text-base !leading-5'
          inputClass='bg-Graylight !text-sm sm:!text-base !leading-5'
          parentClassName='w-full'
        />
      );

    case QuestionTypeEnum.DATE_PICKER:
      return (
        <CustomDatePicker
          selected={answer ? moment(answer as string).toDate() : ''}
          onChange={(date: string | Date) => {
            if (date instanceof Date) {
              onAnswerChange(date.toISOString());
            } else {
              onAnswerChange(date);
            }
          }}
          placeholderText='Select Date of birth'
          name='dob'
          maxDate={new Date()}
          isRequired={true}
          className='Assessment-form-datepicker !p-3'
          parentClassName='!z-0'
        />
      );

    default:
      return null;
  }
};

// Individual question field component
const QuestionField: React.FC<{
  question: DynamicQuestion;
  answer: ValueType;
  readOnly: boolean;
  onAnswerChange: (questionId: string, value: ValueType, inputField?: boolean) => void;
  error?: string;
  fieldRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}> = ({ question, answer, readOnly, onAnswerChange, error, fieldRefs }) => {
  const qKey = getQuestionKey(question);

  return (
    <div
      className='flex flex-col gap-2'
      ref={el => {
        fieldRefs.current[question.id] = el;
      }}
    >
      {question.question_type !== QuestionTypeEnum.BULLET_POINTS &&
        question.question_type !== QuestionTypeEnum.TEXT_HEADER && (
          <label className='text-sm sm:text-base font-normal text-blackdarklight leading-5'>
            {question.question_text}
            {question.is_required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

      <QuestionRenderer
        question={question}
        answer={answer}
        readOnly={readOnly}
        onAnswerChange={(value, inputField) => onAnswerChange(qKey, value, inputField)}
      />
      {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
    </div>
  );
};

// Grouped questions component
const GroupedQuestions: React.FC<{
  groupName: string;
  questions: DynamicQuestion[];
  answers: Record<string, ValueType>;
  readOnly: boolean;
  onAnswerChange: (questionId: string, value: ValueType, inputField?: boolean) => void;
  errors: Record<string, string>;
  fieldRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}> = ({ groupName, questions, answers, readOnly, onAnswerChange, errors, fieldRefs }) => {
  return (
    <div className='border border-solid border-surface rounded-xl p-4 sm:p-5 bg-white'>
      <h3 className='text-lg font-semibold text-blackdark leading-6 mb-4'>{groupName}</h3>
      <div className='flex flex-col gap-5'>
        {questions.map(q => (
          <QuestionField
            key={q?.id}
            question={q}
            answer={answers[getQuestionKey(q)]}
            readOnly={readOnly}
            error={errors[q.id]}
            onAnswerChange={onAnswerChange}
            fieldRefs={fieldRefs}
          />
        ))}
      </div>
    </div>
  );
};

const FormPreview: React.FC<FormPreviewProps> = ({
  formData: form,
  readOnly = false,
  formDataLoading,
  handleOnSubmit,
  ispreviewType = false,
  handleOnCancel,
}) => {
  const [answers, setAnswers] = useState<Record<string, ValueType>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { mutateAsync: uploadFormFiles } = useUploadFormFile();

  const scrollToError = (errors: Record<string, string>) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey && fieldRefs.current[firstErrorKey]) {
      fieldRefs.current[firstErrorKey]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Initialize form and answers from formData
  useEffect(() => {
    if (form) {
      const initialAnswers: Record<string, ValueType> = {};
      form.questions.forEach(q => {
        const key = getQuestionKey(q);
        if (q.value !== null && q.value !== undefined) {
          initialAnswers[key] = q.value;
        }
      });
      setAnswers(initialAnswers);
    }
  }, [form]);

  if (!form) return;

  // Handle answer changes
  const handleAnswerChange = useCallback(
    (questionId: string, value: ValueType) => {
      setAnswers(prev => ({ ...prev, [questionId]: value }));

      if (errors[questionId]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[questionId];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Check if question should be visible based on dependencies
  const checkAnswer = useCallback(
    (question: DynamicQuestion, allQuestions: DynamicQuestion[]): boolean => {
      const dependentOn = question.metadata?.dependent_on;

      if (!dependentOn?.question_number) return true;

      const parentQuestion = allQuestions.find(q => q.order_index == dependentOn.question_number);
      if (!parentQuestion) return false;

      const parentAnswer = answers[getQuestionKey(parentQuestion)];

      let answerValues: string[] = [];

      if (parentAnswer === null || parentAnswer === undefined) {
        answerValues = [];
      } else if (Array.isArray(parentAnswer)) {
        answerValues = (parentAnswer as LabelValue[]).map(a =>
          typeof a === 'object' && a !== null ? a.value : a
        );
      } else if (typeof parentAnswer === 'object' && parentAnswer !== null) {
        const obj = parentAnswer as { value?: unknown; option_value?: unknown };

        if ('value' in obj && obj.value != null) {
          answerValues = [String(obj.value)]; // cast to string
        } else if ('option_value' in obj && obj.option_value != null) {
          answerValues = [String(obj.option_value)]; // cast to string
        } else {
          answerValues = [];
        }
      } else {
        answerValues = [parentAnswer];
      }

      return answerValues.includes(dependentOn.option_value);
    },
    [answers]
  );

  // Get visible and sorted questions
  const visibleQuestions = useMemo(() => {
    return form.questions
      .filter(q => checkAnswer(q, form.questions))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [form.questions, checkAnswer]);

  const questionsByGroup = useMemo(() => {
    const groups: Record<string, DynamicQuestion[]> = {};
    const ungrouped: DynamicQuestion[] = [];

    visibleQuestions.forEach(q => {
      const fieldType = q.metadata?.field_type?.trim();
      if (fieldType) {
        if (!groups[fieldType]) groups[fieldType] = [];
        groups[fieldType].push(q);
      } else {
        ungrouped.push(q);
      }
    });

    return { groups, ungrouped };
  }, [visibleQuestions]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: Record<string, string> = {};

      // Validate required fields
      form.questions.forEach(q => {
        const key = getQuestionKey(q);
        const answer = answers[key];

        // Only validate if field is required AND visible
        const isVisible = checkAnswer(q, form.questions);
        if (q.is_required && isVisible) {
          const isEmpty =
            answer === null ||
            answer === undefined ||
            (typeof answer === 'string' && answer.trim() === '') ||
            (Array.isArray(answer) && answer.length === 0) ||
            (q.question_type === QuestionTypeEnum.FILE_UPLOAD && !(answer as FileItem[]).length);

          if (isEmpty) {
            newErrors[key] = 'This field is required';
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        scrollToError(newErrors);
        return;
      }

      // Step 1: Collect all files from all questions
      const allFilesToUpload: File[] = [];
      const fileQuestionKeys: string[] = [];

      for (const q of form.questions) {
        const key = getQuestionKey(q);
        const answer = answers[key];

        if (
          q.question_type === QuestionTypeEnum.FILE_UPLOAD &&
          Array.isArray(answer) &&
          answer.length
        ) {
          const filesToUpload = (answer as FileItem[])
            .map(item => item.file)
            .filter((f): f is File => !!f);

          if (filesToUpload.length > 0) {
            allFilesToUpload.push(...filesToUpload);
            fileQuestionKeys.push(key);
          }
        }
      }

      // Step 2: Upload all files in one API call
      let uploadedPaths: FileItem[] = [];
      if (allFilesToUpload.length > 0) {
        try {
          const uploadResponse = await uploadFormFiles(allFilesToUpload);
          uploadedPaths = uploadResponse.paths;
        } catch {
          fileQuestionKeys.forEach(key => {
            newErrors[key] = 'File upload failed';
          });
          setErrors(newErrors);
          return;
        }
      }

      // Step 3: Map uploaded URLs back to their respective questions
      const answersWithFileUrls: Record<string, ValueType> = { ...answers };
      let pathIndex = 0;

      for (const q of form.questions) {
        const key = getQuestionKey(q);
        const answer = answers[key];

        if (
          q.question_type === QuestionTypeEnum.FILE_UPLOAD &&
          Array.isArray(answer) &&
          answer.length
        ) {
          const filesToUpload = (answer as FileItem[])
            .map(item => item.file)
            .filter((f): f is File => !!f);

          if (filesToUpload.length > 0) {
            // Extract the URLs for this question
            const questionPaths = uploadedPaths.slice(pathIndex, pathIndex + filesToUpload.length);
            answersWithFileUrls[key] = questionPaths;
            pathIndex += filesToUpload.length;
          }
        }
      }

      // Step 4: Update form and submit
      const updatedQuestions = form.questions.map(q => ({
        ...q,
        value: answersWithFileUrls[getQuestionKey(q)] ?? null,
      }));

      const updatedForm: DynamicForm = {
        ...form,
        questions: updatedQuestions,
      };

      handleOnSubmit?.({
        form_id: form.id,
        response_obj: updatedForm,
      });
    },
    [form, answers, handleOnSubmit]
  );

  if (formDataLoading && !form) {
    return (
      <div className='w-full mx-auto p-6 bg-white rounded-lg shadow-sm'>
        <Spinner />
      </div>
    );
  }

  if (!form) {
    return (
      <>
        <div className='w-full p-5 bg-white rounded-20px border border-solid border-surface'>
          <div className='flex items-center justify-center h-full'>
            <p className='text-blackdark text-base sm:text-xl font-semibold'>No Data To Show</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className='w-full p-5 bg-white rounded-20px border border-solid border-surface'>
      <div className='mb-5'>
        <h2 className='text-xl lg:text-2xl font-bold text-blackdark mb-2'>{form.name}</h2>
        {form.description && (
          <p className='text-base lg:text-lg text-blackdark'>{form.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5 w-full'>
        {visibleQuestions.map(q => {
          const fieldType = q.metadata?.field_type?.trim();

          if (fieldType) {
            // render group once (when first question of group is encountered)
            const groupQuestions = questionsByGroup.groups[fieldType];
            if (groupQuestions[0].id === q.id) {
              return (
                <GroupedQuestions
                  key={fieldType}
                  groupName={fieldType}
                  questions={groupQuestions}
                  answers={answers}
                  readOnly={readOnly}
                  onAnswerChange={handleAnswerChange}
                  errors={errors}
                  fieldRefs={fieldRefs}
                />
              );
            }
            return null; // already rendered this group
          }

          // ungrouped → render individually
          return (
            <QuestionField
              key={q.id}
              question={q}
              answer={answers[getQuestionKey(q)]}
              readOnly={readOnly}
              error={errors[q.id]}
              onAnswerChange={handleAnswerChange}
              fieldRefs={fieldRefs}
            />
          );
        })}

        {form.questions.length === 0 && (
          <div className='text-center py-8 text-blackdark text-lg sm:text-xl font-semibold'>
            <p>No questions added to this form yet.</p>
          </div>
        )}

        {!readOnly && form.questions.length > 0 && !ispreviewType && (
          <div className='flex items-center justify-end gap-5'>
            {handleOnCancel && (
              <Button
                title='Cancel'
                type='button'
                variant='outline'
                className='!px-6 rounded-lg'
                onClick={handleOnCancel}
                isIconFirst
                icon={<Icon name='close' />}
              />
            )}

            <Button
              title='Submit Form'
              type='submit'
              variant='filled'
              className='!px-6 rounded-lg min-h-50px'
              isIconFirst
              icon={<Icon name='chat' />}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default FormPreview;
