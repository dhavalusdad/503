import { useMemo, useState } from 'react';

import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { ClientDependentListing } from '@/features/client/components/ClientProfile/ClientDependentListing';
import CredentialItemsListing from '@/features/management/components/CredentialingItem/CredentialItemsListing';
import Education from '@/features/profile/components/Education';
import Experience from '@/features/profile/components/Experience';
import { ProfileForm } from '@/features/profile/components/ProfileAddEditForm';
import AdminProfile from '@/pages/Profile/AdminProfile';
import ClientProfile from '@/pages/Profile/ClientProfile';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import TabNavigation from '@/stories/Common/TabNavigation';

type AllowedRole = UserRole.CLIENT | UserRole.THERAPIST | UserRole.ADMIN | UserRole.BACKOFFICE;
type Props = {
  userRole?: AllowedRole;
};

const TAB_NAME = {
  BASIC_DETAILS: 'Basic Details',
  EXPERIENCE: 'Experience',
  CLIENT_PROFILE: 'Client Profile',
  DEPENDENT_FORM: 'Dependent Form',
  ADMIN_PROFILE: 'Admin Profile',
  STAFF_PROFILE: 'Staff Profile',
  CREDENTIAL_ITEMS: 'Credential Items',
  EDUCATION: 'Education',
};

const NAVIGATION_TAB: Partial<Record<AllowedRole, string[]>> = {
  [UserRole.THERAPIST]: [
    TAB_NAME.BASIC_DETAILS,
    TAB_NAME.EXPERIENCE,
    TAB_NAME.CREDENTIAL_ITEMS,
    TAB_NAME.EDUCATION,
  ],
  [UserRole.CLIENT]: [TAB_NAME.CLIENT_PROFILE, TAB_NAME.DEPENDENT_FORM],
  [UserRole.ADMIN]: [TAB_NAME.ADMIN_PROFILE],
  [UserRole.BACKOFFICE]: [TAB_NAME.STAFF_PROFILE],
};

const ROLE_WISE_ACTIVE_TAB = {
  [UserRole.THERAPIST]: TAB_NAME.BASIC_DETAILS,
  [UserRole.CLIENT]: TAB_NAME.CLIENT_PROFILE,
  [UserRole.ADMIN]: TAB_NAME.ADMIN_PROFILE,
  [UserRole.BACKOFFICE]: TAB_NAME.STAFF_PROFILE,
};

// ********************* Note **************************
// If you want to use role --> Use modifiedRole variable

// Main Profile component
const Profile = (props: Props) => {
  // ** Props **
  const { userRole } = props;

  // ** Redux **
  const currentUserData = useSelector(currentUser);
  const { role } = currentUserData;
  const [searchParams] = useSearchParams();
  const activeTabFromUrl = searchParams.get('active_tab');
  // ** Vars **
  const modifiedRole = userRole || role;
  const topNavigation = NAVIGATION_TAB[modifiedRole as AllowedRole] || [];

  // ** States **
  const [activeTab, setActiveTab] = useState<string>(
    activeTabFromUrl || ROLE_WISE_ACTIVE_TAB[modifiedRole as AllowedRole]
  );

  const clientProfileTabs = [
    { id: 'client_profile', title: 'Client Profile' },
    { id: 'dependent_form', title: 'Dependent Form' },
  ];

  const adminProfileTabs = [{ id: 'admin', title: 'Admin Profile' }];
  const staffProfileTabs = [{ id: 'staff', title: 'Staff Profile' }];

  const [clientActiveTab, setClientActiveTab] = useState('client_profile');
  const [adminActiveTab, setAdminActiveTab] = useState('admin');
  const [staffActiveTab, setStaffActiveTab] = useState('staff');

  const renderTab = useMemo(() => {
    switch (modifiedRole) {
      case UserRole.THERAPIST:
        switch (activeTab) {
          case TAB_NAME.BASIC_DETAILS:
            return <ProfileForm />;
          case TAB_NAME.EXPERIENCE:
            return <Experience />;
          case TAB_NAME.CREDENTIAL_ITEMS:
            return <CredentialItemsListing />;
          case TAB_NAME.EDUCATION:
            return <Education />;
          default:
            return <></>;
        }
      case UserRole.CLIENT:
        switch (clientActiveTab) {
          case 'dependent_form':
            return <ClientDependentListing />;
          default:
            return <ClientProfile />;
        }

      case UserRole.ADMIN:
        switch (activeTab) {
          default:
            return <AdminProfile />;
        }

      case UserRole.BACKOFFICE:
        switch (activeTab) {
          default:
            return <AdminProfile />;
        }

      default:
        break;
    }
  }, [activeTab, clientActiveTab]);

  return (
    <>
      {modifiedRole === UserRole.CLIENT ? (
        <div className='flex flex-col gap-5'>
          <div className='flex flex-wrap items-center gap-6 border-b border-solid border-surface'>
            {clientProfileTabs.map(tab => (
              <Button
                key={tab.id}
                variant='none'
                title={tab.title}
                onClick={() => setClientActiveTab(tab.id)}
                className={clsx(
                  '!text-lg !leading-6 !pt-0 !pb-3.5 relative ',
                  clientActiveTab === tab.id
                    ? 'text-blackdark !font-bold after:absolute after:bottom-0 after:left-0 after:h-3px after:w-full after:bg-primary'
                    : 'text-primarygray'
                )}
              />
            ))}
          </div>
          {renderTab}
        </div>
      ) : modifiedRole === UserRole.ADMIN ? (
        <div className='flex flex-col gap-5'>
          <div className='flex flex-wrap items-center gap-6 border-b border-solid border-surface'>
            {adminProfileTabs.map(tab => (
              <Button
                key={tab.id}
                variant='none'
                title={tab.title}
                onClick={() => setAdminActiveTab(tab.id)}
                className={clsx(
                  '!text-lg !leading-6 !pt-0 !pb-3.5 relative ',
                  adminActiveTab === tab.id
                    ? 'text-blackdark !font-bold after:absolute after:bottom-0 after:left-0 after:h-3px after:w-full after:bg-primary'
                    : 'text-primarygray'
                )}
              />
            ))}
          </div>
          {renderTab}
        </div>
      ) : modifiedRole === UserRole.BACKOFFICE ? (
        <div className='flex flex-col gap-5'>
          <div className='flex flex-wrap items-center gap-6 border-b border-solid border-surface'>
            {staffProfileTabs.map(tab => (
              <Button
                key={tab.id}
                variant='none'
                title={tab.title}
                onClick={() => setStaffActiveTab(tab.id)}
                className={clsx(
                  '!text-lg !leading-6 !pt-0 !pb-3.5 relative ',
                  staffActiveTab === tab.id
                    ? 'text-blackdark !font-bold after:absolute after:bottom-0 after:left-0 after:h-3px after:w-full after:bg-primary'
                    : 'text-primarygray'
                )}
              />
            ))}
          </div>
          {renderTab}
        </div>
      ) : topNavigation.length ? (
        <>
          {/* Tab Navigation */}
          <TabNavigation
            tabs={topNavigation}
            activeTab={activeTab}
            onTabChange={tab => setActiveTab(tab)}
          />

          {renderTab}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Profile;
