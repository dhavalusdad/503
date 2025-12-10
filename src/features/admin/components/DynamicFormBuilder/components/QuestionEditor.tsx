import React, { useState } from 'react';

import clsx from 'clsx';

import { PermissionType } from '@/enums';
import EditQuestionModal from '@/features/admin/components/DynamicFormBuilder/components/EditQuestionModal';
import { QuestionRenderer } from '@/features/admin/components/DynamicFormBuilder/components/FormPreview';
import { type QuestionEditorProps } from '@/features/admin/components/DynamicFormBuilder/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onUpdate,
  // onDelete,
  // onMoveUp,
  // onMoveDown,
  // canMoveUp,
  // canMoveDown,
  allQuestions,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasPermission } = useRoleBasedRouting();

  return (
    <div className={clsx('border border-solid border-surface rounded-xl p-5 bg-white')}>
      <div className='flex items-center justify-between mb-2.5'>
        <h2 className='text-base font-normal text-blackdarklight'>
          {question.question_text} {question.is_required && <span className='text-red-500'>*</span>}
        </h2>
        {hasPermission(PermissionType.ASSESSMENT_FORM_EDIT) && (
          <Button
            variant='none'
            icon={<Icon name='edit' />}
            onClick={() => setIsModalOpen(true)}
            className='!p-0'
            parentClassName='h-5'
          />
        )}
        {/* <Button
            variant='none'
            icon={<Icon name='dropdownUpArrow' />}
            onClick={onMoveUp}
            isDisabled={!canMoveUp}
            className='p-1'
          />
          <Button
            variant='none'
            icon={<Icon name='dropDown' />}
            onClick={onMoveDown}
            isDisabled={!canMoveDown}
            className='p-1'
          />
          <Button
            variant='none'
            icon={<Icon name='delete' />}
            onClick={onDelete}
            className='p-1 text-red-500 hover:text-red-700'
          /> */}
      </div>
      <div className='w-full'>
        <QuestionRenderer question={question} />
      </div>

      {/* Updated Modal  */}

      {/* Edit Modal */}
      <EditQuestionModal
        isOpen={isModalOpen}
        question={question}
        onClose={() => {
          setIsModalOpen(false);
        }}
        allQuestions={allQuestions || []}
        onSave={updated => {
          onUpdate(updated);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default QuestionEditor;
