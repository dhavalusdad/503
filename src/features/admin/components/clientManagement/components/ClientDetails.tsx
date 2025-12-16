import { useState } from 'react';

import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useGetClientManagementDetailsQuery, useUpdateClientData } from '@/api/clientManagement';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import AddTagsModal from '@/features/admin/components/clientManagement/components/AddTagsModal';
import { isAdminPanelRole } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import type { TagsDataType } from '@/stories/Common/TagsCell/types';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

type Props = {
  clientId: string;
  isTherapistPanel: boolean;
};

const ClientDetails = ({ clientId, isTherapistPanel = false }: Props) => {
  const [openAddTagsModal, setOpenAddTagsModal] = useState(false);
  const { role } = useSelector(currentUser);

  const toggleAddTagsModal = () => {
    setOpenAddTagsModal(!openAddTagsModal);
  };

  const navigate = useNavigate();

  const { data: clientData = {}, isLoading } = useGetClientManagementDetailsQuery(
    clientId,
    !openAddTagsModal
  );

  const updateClientData = useUpdateClientData();
  const { hasPermission } = useRoleBasedRouting();

  if (isLoading) {
    return (
      <>
        <Spinner />
      </>
    );
  }

  const getAge = (dob: string): number | null => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null; // invalid date check

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) age--;

    return age;
  };
  const tags: TagsDataType[] = ((clientData?.user?.tags as unknown as TagsDataType[]) || []).filter(
    Boolean
  );

  const handleLongTermStatusToggle = async () => {
    await updateClientData.mutateAsync({
      clientId,
      is_long_term_patient: !clientData?.is_long_term_patient,
    });
  };

  return (
    <>
      <div className='bg-white rounded-20px border border-solid border-surface p-5'>
        <div className='flex flex-col gap-3.5'>
          <div className='flex flex-wrap gap-5 items-center'>
            <h5 className='text-lg font-bold leading-6 text-blackdark mr-auto'>Client Details</h5>
            {!isTherapistPanel && hasPermission(PermissionType.PATIENT_EDIT) && (
              <Button
                variant='filled'
                title='Edit'
                className='rounded-10px !px-8 min-h-50px'
                onClick={() => navigate(`/client-management/edit-client/${clientId}`)}
              />
            )}

            {isTherapistPanel && (
              <>
                {role === UserRole.THERAPIST && (
                  <CheckboxField
                    id='longTermPatient'
                    isDefaultChecked={clientData?.is_long_term_patient}
                    label='Mark as long term patient'
                    labelClass='whitespace-nowrap !text-base !font-bold'
                    parentClassName='!gap-3'
                    onChange={handleLongTermStatusToggle}
                    isDisabled={updateClientData.isPending}
                    labelPlacement='start'
                  />
                )}
                <Button
                  variant='filled'
                  title='View Wellness Hub'
                  className='rounded-10px min-h-50px'
                  onClick={() =>
                    navigate(ROUTES.WELLNESS_DETAIL.navigatePath(clientId, clientData.user.id))
                  }
                />
              </>
            )}
          </div>
          <span className='w-full h-1px bg-surface' />
          <div className='grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5'>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-bold leading-22px text-blackdark'>Full Name</h6>
              <div className='flex items-center gap-1.5'>
                <Image
                  imgPath={
                    clientData?.user?.profile_image
                      ? `${SERVER_URL}${clientData?.user?.profile_image}`
                      : ''
                  }
                  firstName={clientData?.user?.first_name}
                  lastName={clientData?.user?.last_name}
                  alt='User Avatar'
                  imageClassName='rounded-full object-cover object-center w-full h-full'
                  className='w-10 h-10 bg-surface rounded-full overflow-hidden flex items-center justify-center'
                  initialClassName='!text-base'
                />
                <p className='text-base font-bold leading-22px text-primary'>
                  {clientData?.user?.first_name} {clientData?.user?.last_name}
                </p>
              </div>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-bold leading-22px text-blackdark'>Gender</h6>
              <p className='text-base font-normal leading-22px text-primarygray'>
                {clientData?.user?.gender || 'Not Specified'}
              </p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-bold leading-22px text-blackdark'>Age</h6>
              <p className='text-base font-normal leading-22px text-primarygray'>
                {getAge(clientData?.user?.dob) || 'Not Specified'}
              </p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-bold leading-22px text-blackdark'>Email Address</h6>
              <p className='text-base font-normal leading-22px text-primarygray break-all'>
                {clientData?.user?.email || 'Not Specified'}
              </p>
            </div>
            <div className='flex flex-col gap-1.5'>
              <h6 className='text-base font-bold leading-22px text-blackdark'>Contact Number</h6>
              <p className='text-base font-normal leading-22px text-primarygray'>
                {clientData?.user?.phone || 'Not Specified'}
              </p>
            </div>
            {isAdminPanelRole(role) && (
              <>
                {' '}
                <div className='flex flex-col gap-1.5'>
                  <h6 className='text-base font-bold leading-22px text-blackdark'>
                    Customer Payment Profile Id
                  </h6>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {clientData?.customer_profile_id || 'Not Specified'}
                  </p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <h6 className='text-base font-bold leading-22px text-blackdark'>
                    AMD Patient Id
                  </h6>
                  <p className='text-base font-normal leading-22px text-primarygray'>
                    {clientData?.amd_patient_id || 'Not Specified'}
                  </p>
                </div>
              </>
            )}

            <div
              className={clsx(
                'flex flex-col gap-2.5',
                isAdminPanelRole(role)
                  ? 'col-span-1 md:col-span-2 lg:col-span-3 2xl:col-span-4 3xl:col-span-3'
                  : 'col-span-1 md:col-span-2 lg:col-span-3 3xl:col-span-5'
              )}
            >
              <h6 className='text-base font-bold leading-22px text-blackdark'>Alert Tags</h6>
              {isTherapistPanel && !tags?.length ? (
                <p className='text-base font-normal leading-22px text-primarygray'>Not Assigned</p>
              ) : (
                <div className='flex items-center gap-2.5 flex-wrap'>
                  {tags?.map(tag => {
                    return (
                      <div
                        key={tag.id}
                        style={{ backgroundColor: `#${tag.color}` }}
                        className='flex justify-center rounded-2xl px-2.5 py-1 cursor-pointer'
                        title={tag.name}
                      >
                        <span className='text-sm font-semibold leading-18px text-white'>
                          {tag.name}
                        </span>
                      </div>
                    );
                  })}
                  {!isTherapistPanel &&
                    (hasPermission(PermissionType.PATIENT_EDIT) ||
                      hasPermission(PermissionType.PATIENT_ADD)) && (
                      <div onClick={toggleAddTagsModal} className='cursor-pointer'>
                        <Icon name='roundedplus' className='text-blackdark' />
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {openAddTagsModal && (
        <AddTagsModal
          clientId={clientData?.user?.id}
          isOpen={openAddTagsModal}
          onClose={() => setOpenAddTagsModal(false)}
          closeButton={true}
        />
      )}
    </>
  );
};

export default ClientDetails;
