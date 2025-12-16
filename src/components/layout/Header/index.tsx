import { useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import defaultUserPng from '@/assets/images/default-user.webp';
import { ROUTES } from '@/constants/routePath';
import Notification from '@/features/notification/components';
import { getProfilePath, getSettingsPath } from '@/helper';
import { usePopupClose } from '@/hooks/usePopupClose';
import { currentUser } from '@/redux/ducks/user';
import Breadcrumb from '@/stories/Common/BreadCrumb';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

interface Header {
  logout: () => void;
}
const Header: React.FC<Header> = ({ logout }: Header) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(currentUser);

  const routeData = Object.values(ROUTES).find(
    route =>
      matchPath(route.path, location.pathname) &&
      (route.role ? route.role.includes(user.role) : true)
  );

  const headerRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { isOpen: isProfileVisible, setIsOpen: setProfileVisible } = usePopupClose({
    popupRef: profileRef as React.RefObject<HTMLElement>,
  });

  // const toggleProfile = () =>     setProfileVisible(v => !v);

  const toggleProfile = () => {
    if (isProfileVisible) return;
    setProfileVisible(true);
  };

  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    setProfileVisible(false);
    logout();
  };

  const resolvedBreadcrumbs =
    (routeData?.breadcrumb &&
      routeData?.breadcrumb.map(crumb => {
        if (typeof crumb.label === 'function') {
          const searchParams = new URLSearchParams(location.search);
          return {
            ...crumb,
            label: crumb.label(searchParams),
          };
        }
        return crumb;
      })) ||
    [];

  return (
    <header
      className='w-full bg-white gap-3 px-5 sm:py-17px py-3 flex items-center justify-between border-b border-surface'
      ref={headerRef}
    >
      {/* Page Title */}
      <div className='flex flex-col'>
        <h4 className='text-lg md:text-xl lg:text-22px leading-6 md:leading-7 lg:leading-29px font-bold text-blackdark'>
          {routeData?.headerName || 'Dashboard'}
        </h4>
        <Breadcrumb breadcrumbs={resolvedBreadcrumbs || []} />
      </div>
      <div className='flex items-center sm:justify-end gap-3 lg:gap-5'>
        <Notification />

        <div className='h-10 w-1px bg-surface'></div>
        <div id='tour-profile-menu' className='relative' ref={profileRef}>
          <div
            onClick={toggleProfile}
            className='flex items-center gap-2.5 px-3 py-1.5 cursor-pointer border border-solid border-surface rounded-full'
          >
            <Image
              imgPath={
                user?.profile_image
                  ? user?.profile_image
                  : user?.first_name && user.last_name
                    ? ''
                    : defaultUserPng
              }
              firstName={user?.first_name}
              lastName={user?.last_name}
              alt='User Avatar'
              imageClassName='rounded-full object-cover object-center w-full h-full'
              className='w-9 h-9 rounded-full overflow-hidden bg-surface'
              initialClassName='!text-base'
            />
            <div className='flex-col items-start text-white hidden md:flex'>
              <span className='text-base font-bold leading-5 text-blackdark whitespace-nowrap'>
                {user?.first_name || user?.last_name ? (
                  <>
                    {user?.first_name} {user?.last_name}
                  </>
                ) : (
                  <>Full Name</>
                )}
              </span>
              <span className='text-sm leading-4 font-normal text-primarygray'>
                {user?.email ? <>{user?.email}</> : <>Email</>}
              </span>
            </div>
            <Icon
              name='dropdownArrow'
              className={clsx(
                'ml-1 transition-transform ease-in-out duration-300',
                isProfileVisible ? 'rotate-180' : 'rotate-0'
              )}
            />
          </div>
          {isProfileVisible && (
            <div className='absolute z-50 sm:right-0 mt-2 bg-white rounded-20px p-5 shadow-dropdown border border-solid border-surface sm:min-w-60 min-w-40'>
              <div className='flex-col items-start flex'>
                <span className='text-base font-bold leading-22px text-blackdark'>
                  {user?.first_name || user?.last_name ? (
                    <>
                      {user?.first_name} {user?.last_name}
                    </>
                  ) : (
                    <>Full Name</>
                  )}
                </span>
                <span className='text-sm leading-18px font-normal text-primarygray'>
                  {user?.email ? <>{user?.email}</> : <>Email</>}
                </span>
              </div>
              <div className='bg-surface h-1px w-full my-3'></div>
              <ul>
                <li
                  className='flex items-center gap-2 p-2.5 cursor-pointer hover:bg-surface rounded-10px'
                  onClick={() => {
                    setProfileVisible(false);
                    navigate(getProfilePath(user.role as UserRole));
                  }}
                >
                  <Icon name='user' className='icon-wrapper w-18px h-18px' />
                  <span>My Profile</span>
                </li>
                <li
                  className='flex items-center gap-2 p-2.5 cursor-pointer hover:bg-surface rounded-10px'
                  onClick={() => {
                    setProfileVisible(false);
                    navigate(getSettingsPath(user.role as UserRole));
                  }}
                >
                  <Icon name='settingsBlank' className='icon-wrapper w-18px h-18px' />
                  <span>Settings</span>
                </li>
                <li className='bg-surface h-1px w-full my-3'></li>
                <li
                  className='flex items-center gap-2 p-2.5 cursor-pointer hover:bg-redlight rounded-10px text-red'
                  onClick={handleLogout}
                >
                  <Icon name='logout' className='icon-wrapper w-18px h-18px' />
                  <span>Log Out</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
