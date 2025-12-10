import { useLocation, useNavigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import { getLoginPagePath } from '@/helper';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

const PasswordChanged = () => {
  // ** Hooks **
  const navigate = useNavigate();
  const location = useLocation();

  // ** Constants **
  const currentRole = location.pathname.includes('admin')
    ? UserRole.ADMIN
    : location.pathname.includes('therapist')
      ? UserRole.THERAPIST
      : location.pathname.includes(ROUTES.PASSWORD_CHANGED.path)
        ? UserRole.CLIENT
        : null;

  // ** Helpers **
  const handleNavigation = () => {
    const loginPath = getLoginPagePath(currentRole);
    navigate(loginPath);
  };

  return (
    <div className='flex flex-col gap-30px'>
      <div className='text-center'>
        <Icon name='tickcircle' className='inline-block text-Green' />
      </div>
      <div className='flex flex-col gap-2.5 text-center'>
        <h4 className='text-2xl font-bold text-blackdark'>Password Changed!</h4>
        <p className='text-base font-normal text-primarygray'>
          Your password has been changed successfully. Use your new password to Log In.
        </p>
      </div>
      <div className='flex flex-col gap-4'>
        <Button
          variant='filled'
          title='Go to login page'
          className='w-full rounded-10px !font-bold !leading-5'
          onClick={handleNavigation}
        />
      </div>
    </div>
  );
};

export default PasswordChanged;
