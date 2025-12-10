import { useEffect, useState } from 'react';

import { timeAgo } from '@/api/utils';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import { InputField } from '@/stories/Common/Input';
import type { NoteCardProps } from '@/stories/Common/NoteCard/types';
import RichTextEditorField from '@/stories/Common/RichTextEditer';

interface ModalType {
  discard: boolean;
}
type SaveMode = 'draft' | 'final';
export const NoteCard = ({ title, content, updated_at, onSave }: NoteCardProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [noteTitle, setNoteTitle] = useState(title);
  const [noteContent, setNoteContent] = useState(content);
  const [openModal, setOpenModal] = useState<ModalType>({
    discard: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const handleToggle = () => {
    setIsVisible(prev => !prev);
  };
  const handleEditNote = () => {
    setIsEditMode(true);
  };

  useEffect(() => {
    if (isEditMode) {
      setNoteTitle(title);
      setNoteContent(content);
    }
  }, [title, content, isEditMode]);

  const handleSaveNote = (mode: SaveMode) => {
    if (onSave) {
      onSave({
        title: noteTitle,
        content: noteContent,
        is_draft: mode === 'draft',
      });
    }
    setIsEditMode(false);
    setIsVisible(false);
  };

  const openCloseModal = (modalName: keyof ModalType, actionBool: boolean) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
    }));
  };
  const handleDiscardChanges = () => {
    if (noteTitle !== title || noteContent !== content) {
      openCloseModal('discard', true);
    } else {
      setIsEditMode(false);
    }
  };

  const onConfirm = () => {
    setNoteTitle(title);
    setNoteContent(content);
    setIsEditMode(false);
    openCloseModal('discard', false);
  };
  return (
    <div className='w-full bg-Gray rounded-20px px-5 pt-5 pb-1'>
      <div className='flex items-center justify-between '>
        <h3 className='text-base leading-4 font-bold text-blackdark'>
          {isEditMode ? 'Edit Memo' : title}
        </h3>
        {!isEditMode && (
          <Button
            variant='none'
            icon={<Icon name='edit' />}
            className='!p-0'
            onClick={handleEditNote}
            parentClassName='h-5'
          />
        )}
      </div>
      <hr className={`border-blackdark/20 mt-3.5 ${isEditMode ? '' : ''}`} />

      {isEditMode ? (
        <div className='flex flex-col gap-5 my-6'>
          <InputField
            type='text'
            value={noteTitle}
            onChange={e => setNoteTitle(e.target.value)}
            placeholder='memo title'
            inputClass='bg-white'
          />
          <RichTextEditorField
            value={noteContent}
            onChange={setNoteContent}
            placeholder='memo content'
            label='Memo'
            isRequired={true}
            className='border border-surface bg-white !rounded-lg'
            parentClassName='w-full'
          />

          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              title='Discard'
              className='rounded-lg !font-bold'
              onClick={handleDiscardChanges}
            />
            <div className='relative'>
              <Button
                variant='filled'
                title='Save Changes'
                icon={<Icon name='dropdownArrow' className='rotate-180' />}
                className='rounded-lg !font-bold '
                onClick={handleToggle}
                isDisabled={noteTitle === title && noteContent === content}
              />
              {isVisible && (
                <div className='absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-dropdown w-full overflow-hidden'>
                  <Button
                    variant='none'
                    title='Save as Draft'
                    className='w-full rounded-none justify-start hover:bg-surface'
                    onClick={() => handleSaveNote('draft')}
                  />
                  <Button
                    variant='none'
                    title='Save and View'
                    className='w-full rounded-none justify-start hover:bg-surface'
                    onClick={() => handleSaveNote('final')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='mt-5 flex flex-col gap-5'>
          <div
            className='text-blackdark font-normal text-base whitespace-pre-wrap'
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <span className='text-base font-normal text-primarygray'>{`Updated ${timeAgo(updated_at)}`}</span>
        </div>
      )}

      {openModal.discard && (
        <AlertModal
          isOpen={openModal.discard}
          onClose={() => openCloseModal('discard', false)}
          onSubmit={onConfirm}
          alertMessage='If you cancel, your changes will be lost. Are you sure you want to proceed?'
          title='Confirm Discard'
        />
      )}
    </div>
  );
};
