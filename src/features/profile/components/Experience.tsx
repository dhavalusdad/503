import { useMemo, useState } from 'react';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  useDeleteTherapistExperience,
  useGetAllTherapistExperience,
} from '@/api/therapist-experience';
import type { AllTherapistExperienceResponse } from '@/api/types/therapist.dto';
import { UserRole } from '@/api/types/user.dto';
import { PermissionType } from '@/enums';
import AddExperienceModal from '@/features/profile/components/AddExperienceModal';
import { isAdminPanelRole } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import LongCard from '@/stories/Common/LongCard';

type ModalType = {
  addUpdate: boolean;
  delete: boolean;
  experience_id?: string;
};

export const Experience = () => {
  // ** Redux **
  const currentUserData = useSelector(currentUser);

  // ** Hooks **
  const params = useParams();

  // ** Vars **
  const { therapist_id } = params;
  const { role } = currentUserData;
  const isAdmin = isAdminPanelRole(role);

  // *** States ***
  const [openModal, setOpenModal] = useState<ModalType>({
    addUpdate: false,
    delete: false,
  });

  // *** Services ***
  const { data: experienceData, isPending: isGetExperiencesApiPending } =
    useGetAllTherapistExperience({
      therapist_id,
      options: {
        enabled: isAdmin ? !!therapist_id : true,
      },
    });

  const {
    mutateAsync: deleteTherapistExperienceApi,
    isPending: isDeleteTherapistExperienceApiPending,
    error: deleteTherapistExperienceError,
  } = useDeleteTherapistExperience({ therapist_id });

  // ** Hooks **
  const { hasPermission } = useRoleBasedRouting();

  // *** Helpers ***
  const openCloseModal = (
    modalName: keyof ModalType,
    actionBool: boolean,
    experience_id?: string
  ) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      experience_id: experience_id ?? undefined,
    }));
  };

  const onCloseAddEditModal = async () => {
    openCloseModal('addUpdate', false);
  };

  const onDeleteExperience = async () => {
    if (openModal.experience_id) {
      await deleteTherapistExperienceApi(openModal.experience_id);
    }
    if (!deleteTherapistExperienceError) {
      openCloseModal('delete', false);
    }
  };

  const isEditable = useMemo(() => {
    return role === UserRole.BACKOFFICE ? hasPermission(PermissionType.THERAPIST_EDIT) : true;
  }, [role, hasPermission]);

  return (
    <div className='bg-white w-full rounded-20px p-5 border border-solid border-surface'>
      <div className='flex gap-3 justify-between items-center mb-5'>
        <div className='flex flex-col gap-1.5'>
          <h3 className='text-lg font-bold leading-6 text-blackdark'>Experience</h3>
          {!isGetExperiencesApiPending && !isAdmin && experienceData?.inRequestMode && (
            <p className='text-yellow-600 text-sm font-semibold'>
              Your request to create new experiences are sent to admin. Once it is approved you will
              be able to view it
            </p>
          )}
        </div>

        {isEditable && (
          <div className='flex items-center gap-2.5'>
            <Button
              variant='filled'
              title='Add New Experience'
              isIconFirst
              icon={<Icon name='plus' />}
              className='rounded-lg py-3 whitespace-nowrap'
              onClick={() => openCloseModal('addUpdate', true)}
              type='button'
            />
          </div>
        )}
      </div>
      {isGetExperiencesApiPending ? (
        <Spinner />
      ) : (
        <>
          {experienceData?.data.length ? (
            experienceData?.data.map(
              (experience: AllTherapistExperienceResponse, index: number) => (
                <LongCard
                  key={index}
                  data={experience}
                  isEnd={index === experienceData?.data.length - 1}
                  onEdit={experience_id => openCloseModal('addUpdate', true, experience_id)}
                  onDelete={experience_id => openCloseModal('delete', true, experience_id)}
                  isEditable={isEditable}
                />
              )
            )
          ) : (
            <></>
          )}
        </>
      )}

      {openModal.addUpdate && (
        <AddExperienceModal
          experience_id={openModal.experience_id}
          isOpenModal={openModal.addUpdate}
          onClose={onCloseAddEditModal}
        />
      )}

      {openModal.delete && (
        <DeleteModal
          isOpen={openModal.delete}
          onClose={() => openCloseModal('delete', false)}
          onSubmit={onDeleteExperience}
          isSubmitLoading={isDeleteTherapistExperienceApiPending}
          message={`Are you sure you want to delete this experience?`}
        />
      )}
    </div>
  );
};

export default Experience;
