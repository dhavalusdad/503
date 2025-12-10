import { useEffect, useState } from 'react';

import { useAssignRemoveUserTag, useGetClientManagementTagsQuery } from '@/api/clientManagement';
import { showToast } from '@/helper';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Modal from '@/stories/Common/Modal';
import type { TagsDataType } from '@/stories/Common/TagsCell/types';

export interface AddTagsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  closeButton: boolean;
  clientId: string;
}

const AddTagsModal: React.FC<AddTagsModalProps> = ({
  isOpen = false,
  onClose,
  closeButton,
  clientId,
}) => {
  const { data, isLoading } = useGetClientManagementTagsQuery(clientId);
  const [tags, setTags] = useState<{ selected: TagsDataType[]; notSelected: TagsDataType[] }>({
    selected: [],
    notSelected: [],
  });

  const [userTags, setUserTags] = useState<{ toAssign: string[]; toRemove: string[] }>({
    toAssign: [],
    toRemove: [],
  });

  const { mutateAsync: assignRemoveTag } = useAssignRemoveUserTag();

  useEffect(() => {
    if (data?.assigned && data?.unassigned) {
      setTags({ selected: data.assigned, notSelected: data.unassigned });
    }
  }, [data?.assigned, data?.unassigned]);

  const handleTags = async (id: string) => {
    try {
      if (!tags) return;

      // Check if the tag is currently in "selected" (removing it)
      const tagInSelected = tags.selected.find(tag => tag.id === id);
      if (tagInSelected) {
        const newSelected = tags.selected.filter(tag => tag.id !== id);
        const newNotSelected = [...tags.notSelected, tagInSelected];

        setTags({
          selected: newSelected,
          notSelected: newNotSelected,
        });

        // Update userTags: remove from toAssign if it exists, add to toRemove
        setUserTags(prev => ({
          toAssign: prev.toAssign.filter(tagId => tagId !== id),
          toRemove: prev.toRemove.includes(id) ? prev.toRemove : [...prev.toRemove, id],
        }));
        return;
      }

      // Check if the tag is currently in "notSelected" (adding it)
      const tagInNotSelected = tags.notSelected.find(tag => tag.id === id);
      if (tagInNotSelected) {
        const newNotSelected = tags.notSelected.filter(tag => tag.id !== id);
        const newSelected = [...tags.selected, tagInNotSelected];

        setTags({
          selected: newSelected,
          notSelected: newNotSelected,
        });

        // Update userTags: remove from toRemove if it exists, add to toAssign
        setUserTags(prev => ({
          toAssign: prev.toAssign.includes(id) ? prev.toAssign : [...prev.toAssign, id],
          toRemove: prev.toRemove.filter(tagId => tagId !== id),
        }));
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        showToast(error.message, 'ERROR');
      } else {
        showToast('An unexpected error occurred', 'ERROR');
      }
    }
  };

  const handleSubmitTags = async () => {
    try {
      // Only send the API call if there are changes to make
      if (userTags.toAssign.length === 0 && userTags.toRemove.length === 0) {
        onClose();
        return;
      }

      const res = await assignRemoveTag({
        user_id: clientId,
        selectedTagIds: userTags.toAssign, // Tags to assign
        notSelectedTagIds: userTags.toRemove, // Tags to remove
      });

      showToast(res.data?.message || 'Tags updated successfully');
      onClose();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        showToast(error.message, 'ERROR');
      } else {
        showToast('An unexpected error occurred', 'ERROR');
      }
    }
  };

  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <Modal
      title={'Add Tag'}
      className={''}
      parentClassName={''}
      size={'sm'}
      isOpen={isOpen}
      onClose={onClose}
      closeButton={closeButton}
      footer={
        <div className='flex justify-end gap-2'>
          <Button
            variant='filled'
            title='Done'
            className='px-6 py-3.5 rounded-10px !font-bold !leading-22px'
            onClick={handleSubmitTags}
          />
        </div>
      }
      footerClassName='pt-5 border-t border-solid border-surface'
      contentClassName='pt-30px'
    >
      <div className='flex flex-col gap-5'>
        <div className='bg-surfacelight border border-solid border-surface rounded-2xl p-3.5'>
          <div className='flex flex-col gap-3.5'>
            <h4 className='text-xl font-bold leading-7 text-blackdark'>Current Tags</h4>
            <div className='flex items-center gap-5 flex-wrap'>
              {tags?.selected?.map((tag: TagsDataType) => {
                return (
                  <div key={tag.id}>
                    <div className='flex items-center gap-1'>
                      <div
                        style={{ backgroundColor: `#${tag.color}` }}
                        className={`flex justify-center rounded-2xl px-4 py-1 cursor-default`}
                        title={tag.name}
                      >
                        <span className='text-sm font-semibold leading-[18px] text-white'>
                          {tag.name}
                        </span>
                      </div>
                      <div
                        className='bg-red-100 rounded-full cursor-pointer'
                        onClick={() => handleTags(tag.id)}
                      >
                        <Icon name='close' className='text-orange-600' />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className='w-full h-1px bg-surface' />
        <div className='flex flex-col gap-3.5'>
          <h4 className='text-xl font-bold leading-7 text-blackdark'>Add New</h4>
          <div className='flex items-center gap-5 flex-wrap'>
            {tags?.notSelected?.map(tag => (
              <div className='flex items-center gap-3.5' key={tag.id}>
                <div
                  className={`bg-red rounded-20px px-3 py-1`}
                  style={{ backgroundColor: `#${tag.color}` }}
                >
                  <span className='text-sm font-semibold leading-18px text-white'>{tag.name}</span>
                </div>

                <div
                  className={`w-30px h-30px rounded-full flex items-center justify-center bg-red-100 cursor-pointer`}
                  onClick={() => handleTags(tag.id)}
                >
                  <Icon name='plus' className='text-blackdark' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddTagsModal;
