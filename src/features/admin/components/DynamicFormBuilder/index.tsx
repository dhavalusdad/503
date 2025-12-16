import React, { useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useCreateAssessmentForms,
  useGetAssessmentFormDetails,
  useUpdateAssessmentFormRequest,
} from '@/api/assessment-forms';
import { ROUTES } from '@/constants/routePath';
import { PermissionType, QuestionTypeEnum } from '@/enums';
import EditQuestionModal from '@/features/admin/components/DynamicFormBuilder/components/EditQuestionModal';
import FormPreview from '@/features/admin/components/DynamicFormBuilder/components/FormPreview';
import QuestionEditor from '@/features/admin/components/DynamicFormBuilder/components/QuestionEditor';
import {
  type DynamicForm,
  type DynamicQuestion,
  type FormBuilderProps,
} from '@/features/admin/components/DynamicFormBuilder/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import Icon, { type IconNameType } from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import TextArea from '@/stories/Common/Textarea';

const DynamicFormBuilder: React.FC<FormBuilderProps> = ({ initialForm, onPreview }) => {
  const [form, setForm] = useState<DynamicForm>(
    initialForm || {
      uid: Date.now().toString(),
      name: 'Untitled Form',
      description: '',
      questions: [],
      form_type: '',
      id: '',
    }
  );

  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useRoleBasedRouting();
  const [showPreview, setShowPreview] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [creatingQuestion, setCreatingQuestion] = useState<DynamicQuestion>();
  const [isCreateModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const { mutateAsync: createAssessmentForm } = useCreateAssessmentForms();
  const { mutateAsync: updateAsessmentForm } = useUpdateAssessmentFormRequest();
  const { register, setValue } = useForm();

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
    }
  }, [initialForm]);

  let FormData: DynamicForm;
  if (id) {
    const { data } = useGetAssessmentFormDetails(id);
    FormData = data;
  }

  useEffect(() => {
    if (id && FormData) {
      setForm(FormData);
      setValue('description', FormData.description);
    }
  }, [id, FormData]);

  // const addQuestion = () => {
  //   const newQuestion: DynamicQuestion = {
  //     uid: Date.now().toString(),
  //     question: 'New Question',
  //     type: 'short-answer',
  //     required: false,
  //     placeholder: '',
  //   };

  //   setForm(prev => ({
  //     ...prev,
  //     questions: [...prev.questions, newQuestion],
  //   }));
  //   setShowAddQuestion(false);
  // };

  const getQuestionKey = (q: DynamicQuestion) => q.id?.toString() ?? q.uid;

  const updateQuestion = (questionId: string, updatedQuestion: DynamicQuestion) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => (getQuestionKey(q) === questionId ? updatedQuestion : q)),
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => getQuestionKey(q) !== questionId),
    }));
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    setForm(prev => {
      const questions = [...prev.questions];
      const currentIndex = questions.findIndex(q => getQuestionKey(q) === questionId);

      if (
        (direction === 'up' && currentIndex > 0) ||
        (direction === 'down' && currentIndex < questions.length - 1)
      ) {
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        [questions[currentIndex], questions[targetIndex]] = [
          questions[targetIndex],
          questions[currentIndex],
        ];

        questions.forEach((q, idx) => {
          q.order_index = idx;
        });
      }

      return { ...prev, questions };
    });
  };

  const handleSave = () => {
    if (id) {
      updateAsessmentForm({ data: form, id });
    } else {
      createAssessmentForm(form);
    }
    navigate(ROUTES.ASSESSMENT_FORM.path);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(form);
    } else {
      setShowPreview(true);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.ASSESSMENT_FORM.path);
  };

  return (
    <>
      <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
        <div className='flex flex-col gap-5'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <h1 className='text-lg font-bold text-blackdark leading-6'>Create Assessment Form</h1>
            <div className='flex items-center gap-5'>
              <Button
                variant='outline'
                title='Preview'
                onClick={handlePreview}
                icon={<Icon name='eye' className='icon-wrapper w-5 h-5' />}
                isIconFirst
                className=' rounded-lg'
              />
              {hasPermission(PermissionType.ASSESSMENT_FORM_EDIT) && (
                <Button
                  variant='filled'
                  title='Save Form'
                  onClick={handleSave}
                  icon={<Icon name='chat' className='icon-wrapper w-4 h-4' />}
                  isIconFirst
                  className=' rounded-lg min-h-50px'
                />
              )}
            </div>
          </div>

          {/* Form Details */}
          <div className='flex flex-col gap-5'>
            <InputField
              type='text'
              label='Form Title'
              isRequired
              labelClass='!text-base'
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder='Enter form title...'
              inputClass='!text-base !leading-5 bg-Graylight'
            />
            <TextArea
              label='Form Description'
              labelClass='!text-base'
              // name={form.description || ''}
              onChange={e => {
                setForm(prev => ({ ...prev, description: e.target.value }));
                setValue('description', e.target.value);
              }}
              placeholder='Enter form description...'
              rows={3}
              name={'description'}
              register={register}
              className='w-full !text-base !leading-5 bg-Graylight'
            />
            {/* <Select
              label='Form Type'
              labelClassName='!text-base !leading-5'
              name={form.form_type || ''}
              onChange={value => {
                setForm(prev => ({ ...prev, form_type: value?.value }));
              }}
              value={ASSESSMENT_FORM_TYPE_OPTIONS.find(option => option.value == form.form_type)}
              placeholder='Enter form description...'
              options={ASSESSMENT_FORM_TYPE_OPTIONS}
              StylesConfig={{
                control: () => ({
                  minHeight: '50px',
                  background: '#F9FAFB',
                }),
              }}
            /> */}
          </div>

          {/* Questions Section */}
          <div className='relative flex flex-col gap-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-bold text-blackdark leading-6'>
                Questions ({form.questions.length})
              </h2>
              {/* <Button
              variant='filled'
              onClick={() => setShowAddQuestion(true)}
              icon={<Icon name='plus' />}
              className=''
            >
              Add Question
            </Button> */}
            </div>
            <div className='flex flex-col gap-5'>
              {(() => {
                const renderedGroups = new Set<string>();

                return (
                  form.questions
                    // .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                    .map((question, index) => {
                      const qKey = getQuestionKey(question);
                      const fieldType = question.metadata?.field_type?.trim();

                      if (fieldType) {
                        if (renderedGroups.has(fieldType)) {
                          return null; // already rendered this group, skip
                        }
                        renderedGroups.add(fieldType);

                        const groupQuestions = form.questions.filter(
                          q => q.metadata?.field_type?.trim() === fieldType
                        );
                        // .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

                        return (
                          <div
                            key={fieldType}
                            className='border border-solid border-surface rounded-xl p-5 bg-Graylight'
                          >
                            <h3 className='text-lg font-semibold text-blackdark leading-6 mb-3.5'>
                              {fieldType}
                            </h3>
                            <div className='flex flex-col gap-5'>
                              {groupQuestions.map((q, idx) => {
                                const gKey = getQuestionKey(q);
                                return (
                                  <QuestionEditor
                                    allQuestions={form.questions}
                                    key={gKey}
                                    question={q}
                                    onUpdate={updatedQuestion =>
                                      updateQuestion(gKey, updatedQuestion)
                                    }
                                    onDelete={() => deleteQuestion(gKey)}
                                    onMoveUp={() => moveQuestion(gKey, 'up')}
                                    onMoveDown={() => moveQuestion(gKey, 'down')}
                                    canMoveUp={idx > 0}
                                    canMoveDown={idx < groupQuestions.length - 1}
                                    index={idx}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      } else {
                        // ungrouped question
                        return (
                          <QuestionEditor
                            key={qKey}
                            allQuestions={form.questions}
                            question={question}
                            onUpdate={updatedQuestion => updateQuestion(qKey, updatedQuestion)}
                            onDelete={() => deleteQuestion(qKey)}
                            onMoveUp={() => moveQuestion(qKey, 'up')}
                            onMoveDown={() => moveQuestion(qKey, 'down')}
                            canMoveUp={index > 0}
                            canMoveDown={index < form.questions.length - 1}
                            index={index}
                          />
                        );
                      }
                    })
                );
              })()}
            </div>

            <div className='flex items-center justify-between'>
              <div className='text-lg text-blackdark'>
                <span>
                  {form.questions.length} question{form.questions.length !== 1 ? 's' : ''} •
                </span>
                <span>{form.questions.filter(q => q.is_required).length} required</span>
              </div>
              <div className='flex items-center gap-5'>
                <Button
                  title='Cancel'
                  variant='outline'
                  onClick={handleCancel}
                  icon={<Icon name='close' />}
                  isIconFirst
                  className='rounded-lg min-h-50px'
                />
                {hasPermission(PermissionType.ASSESSMENT_FORM_EDIT) && (
                  <Button
                    title='Save Form'
                    variant='filled'
                    onClick={handleSave}
                    icon={<Icon name='chat' />}
                    isIconFirst
                    className='rounded-lg min-h-50px'
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      <Modal
        isOpen={showAddQuestion}
        onClose={() => setShowAddQuestion(false)}
        title='Add New Question'
        size='lg'
      >
        <div className='p-6'>
          <div className='text-center'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Choose Question Type</h3>
            <div className='grid grid-cols-2 gap-4'>
              {[
                { type: QuestionTypeEnum.SHORT_ANSWER, label: 'Short Answer', icon: 'chat' },
                { type: QuestionTypeEnum.RATING, label: 'Text Area', icon: 'chat' },
                { type: QuestionTypeEnum.RADIO, label: 'Radio Buttons', icon: 'chat' },
                { type: QuestionTypeEnum.SINGLE_CHOICE, label: 'Dropdown Select', icon: 'chat' },
                { type: QuestionTypeEnum.RATING, label: 'Number Input', icon: 'chat' },
              ].map(({ type, label, icon }) => (
                <Button
                  key={type}
                  variant='filled'
                  onClick={() => {
                    const newQuestion: DynamicQuestion = {
                      uid: Date.now().toString(),
                      question_text: '',
                      question_type: type as QuestionTypeEnum,
                      is_required: false,
                      placeholder: '',
                      id: '',
                      value: '',
                      order_index: form.questions.length + 1,
                    };
                    setForm(prev => ({
                      ...prev,
                      questions: [...prev.questions, newQuestion],
                    }));
                    setCreatingQuestion(newQuestion);
                    setShowAddQuestion(false);
                    setCreateModalOpen(true);
                  }}
                  className='flex flex-col items-center gap-2 p-4 h-20'
                >
                  <Icon name={icon as IconNameType} className='h-6 w-6' />
                  <span className='text-sm'>{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title='Edit Question'
        isOpen={isCreateModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
        }}
        size='xl'
      >
        <EditQuestionModal
          question={creatingQuestion}
          onClose={() => {
            setCreateModalOpen(false);
          }}
          onSave={updated => {
            updateQuestion(getQuestionKey(creatingQuestion), updated);
            setCreateModalOpen(false);
          }}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title='Form Preview'
        size='2xl'
        id='form-preview-modal'
      >
        <FormPreview formData={form} ispreviewType={true} />
      </Modal>
    </>
  );
};

export default DynamicFormBuilder;
