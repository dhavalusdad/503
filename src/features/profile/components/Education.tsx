import { useMemo, useState } from 'react';

import moment from 'moment';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  useDeleteTherapistEducation,
  useGetAllTherapistEducation,
} from '@/api/therapist-education';
import { UserRole } from '@/api/types/user.dto';
import { PermissionType } from '@/enums';
import AddEducationModal from '@/features/profile/components/AddEducationModal';
import type {
  EducationOpenModalStateType,
  GetAllTherapistEducationType,
} from '@/features/profile/types';
import { DATE_FORMATS, isAdminPanelRole } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import { DeleteModal } from '@/stories/Common/DeleteModal';
import Icon from '@/stories/Common/Icon';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';

const EducationCard = (
  params: GetAllTherapistEducationType & {
    openCloseModal: (
      modalName: keyof EducationOpenModalStateType,
      actionBool: boolean,
      id?: string
    ) => void;
    isEditable: boolean;
  }
) => {
  const { id, degree, end_date, institution, start_date, inRequest, openCloseModal, isEditable } =
    params;
  const formattedStartDate = start_date
    ? moment(start_date).format(DATE_FORMATS.SHORT_MONTH_AND_YEAR)
    : null;
  const formattedEndDate = end_date
    ? moment(end_date).format(DATE_FORMATS.SHORT_MONTH_AND_YEAR)
    : null;

  return (
    <div className='flex items-start gap-5 justify-between w-full'>
      <div className='flex flex-col gap-1.5'>
        <h3 className='font-bold leading-22px text-blackdark text-base'>{institution || '-'}</h3>
        {degree && <p className='text-sm font-normal leading-18px text-primarygray'>{degree}</p>}
        {(formattedStartDate || formattedEndDate) && (
          <p className='text-sm font-normal leading-18px text-primarygray'>
            {formattedStartDate ?? ''}
            {start_date && end_date ? ` - ` : ''} {formattedEndDate ?? ''}
          </p>
        )}
      </div>
      {isEditable && (
        <>
          {inRequest ? (
            <span className='rounded-full bg-primary/60 text-white py-1 px-4 text-sm leading-5'>
              Requested
            </span>
          ) : (
            <div className='flex items-center gap-2.5'>
              <Button
                onClick={() => openCloseModal('addUpdate', true, id)}
                variant='none'
                className='w-10 h-10 bg-surface rounded-lg !p-0'
                aria-label={`Edit ${degree}`}
                title=''
                icon={<Icon name='edit' />}
                isDisabled={inRequest}
              />
              <Button
                onClick={() => openCloseModal('delete', true, id)}
                variant='none'
                className='w-10 h-10 bg-surface rounded-lg !p-0'
                aria-label={`Edit ${degree}`}
                title=''
                icon={<Icon name='delete' className='text-red' />}
                isDisabled={inRequest}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const Education = () => {
  // ** Redux **
  const currentUserData = useSelector(currentUser);

  // ** Hooks **
  const params = useParams();

  // ** Vars **
  const { therapist_id } = params;
  const { role } = currentUserData;
  const isAdmin = isAdminPanelRole(role);

  // *** States ***
  const [openModal, setOpenModal] = useState<EducationOpenModalStateType>({
    addUpdate: false,
    delete: false,
    addDegree: false,
  });

  // *** Services ***
  const { data: educationData, isPending: isGetEducationsApiPending } = useGetAllTherapistEducation(
    {
      therapist_id,
      options: {
        enabled: isAdmin ? !!therapist_id : true,
      },
    }
  );

  const {
    mutateAsync: deleteTherapistEducationAPI,
    isPending: isDeleteTherapistEducationApiPending,
  } = useDeleteTherapistEducation({ therapist_id });

  const { hasPermission } = useRoleBasedRouting();

  // *** Helpers ***
  const openCloseModal = (
    modalName: keyof EducationOpenModalStateType,
    actionBool: boolean,
    id?: string
  ) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      id: id ?? undefined,
    }));
  };

  const onCloseAddEditModal = async () => {
    openCloseModal('addUpdate', false);
  };

  const onDeleteEducation = async () => {
    if (openModal.id) {
      await deleteTherapistEducationAPI(openModal.id, {
        onSuccess() {
          openCloseModal('delete', false);
        },
      });
    }
  };

  const isEditable = useMemo(() => {
    return role === UserRole.BACKOFFICE ? hasPermission(PermissionType.THERAPIST_EDIT) : true;
  }, [role, hasPermission]);

  return (
    <div className='bg-white w-full rounded-20px p-5 border border-solid border-surface'>
      <div className='flex flex-wrap gap-5 justify-between items-center mb-5'>
        <div className='flex flex-col gap-1.5 flex-1'>
          <h3 className='text-lg font-bold leading-6 text-blackdark'>Education</h3>
          {!isGetEducationsApiPending && !isAdmin && educationData?.inRequestMode && (
            <p className='text-yellow-600 text-sm font-semibold'>
              Your request to create new experiences are sent to admin. Once it is approved you will
              be able to view it
            </p>
          )}
        </div>
        {isEditable && (
          <Button
            variant='filled'
            title='Add New Education'
            isIconFirst
            icon={<Icon name='plus' />}
            className='rounded-lg py-3 whitespace-nowrap'
            onClick={() => openCloseModal('addUpdate', true)}
            type='button'
          />
        )}
      </div>

      {isGetEducationsApiPending ? (
        <Spinner />
      ) : (
        <>
          {educationData?.data.length ? (
            educationData?.data.map((education: GetAllTherapistEducationType) => (
              <div
                className={`pb-5 mb-5 last:pb-0 last:mb-0 flex relative border-b border-solid border-surface last:border-b-0`}
              >
                <EducationCard
                  key={education.id}
                  {...education}
                  openCloseModal={openCloseModal}
                  isEditable={
                    role === UserRole.BACKOFFICE
                      ? hasPermission(PermissionType.THERAPIST_EDIT)
                      : true
                  }
                />
              </div>
            ))
          ) : (
            <></>
          )}
        </>
      )}

      {openModal.addUpdate && (
        <AddEducationModal
          education_id={openModal.id}
          isOpenModal={openModal.addUpdate}
          onClose={onCloseAddEditModal}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      )}

      {openModal.delete && (
        <DeleteModal
          isOpen={openModal.delete}
          onClose={() => openCloseModal('delete', false)}
          onSubmit={onDeleteEducation}
          isSubmitLoading={isDeleteTherapistEducationApiPending}
          message={`Are you sure you want to delete this education?`}
        />
      )}
    </div>
  );
};

export default Education;
