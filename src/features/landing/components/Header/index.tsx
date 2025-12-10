import React from 'react';

import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import { useDeviceType } from '@/hooks/useDeviceType';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

export const Header = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  return (
    <div className='bg-white border border-solid border-surface lg:py-30px lg:px-38px py-4 px-4 rounded-20px'>
      <div className='flex items-center justify-between'>
        <React.Fragment>
          {deviceType === 'mobile' || deviceType === 'mobilehorizontal' ? (
            <Icon name='smallLogo' className='' />
          ) : (
            <Icon name='logo' className='icon-wrapper h-9 lg:h-auto' />
          )}
        </React.Fragment>
        <div className='flex items-center lg:gap-10 gap-5'>
          <p
            onClick={() => navigate(ROUTES.LOGIN.path)}
            className='cursor-pointer text-sm lg:text-lg font-medium text-blackdark hover:underline underline-offset-2'
          >
            Existing Patient Login
          </p>
          <div className='flex items-center gap-2.5 lg:gap-5'>
            <Button
              variant='none'
              title='1-866-478-3978'
              icon={<Icon name='phone' className='text-blackdark' />}
              isIconFirst
              className='!px-3 lg:!px-6 rounded-10px !leading-5 border border-solid border-blackdark !text-sm lg:!text-base'
            />
            <Button
              variant='filled'
              title='Create Account'
              onClick={() => navigate(ROUTES.REGISTER.path)}
              className='!px-3 lg:!px-6 rounded-10px !leading-5 !text-sm lg:!text-base'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
