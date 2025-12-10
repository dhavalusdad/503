import { useLocation } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import ForgotPassword from '@/features/login/components/RightContent/ForgotPassword';
import PasswordChanged from '@/features/login/components/RightContent/PasswordChanged';
import ResetPassword from '@/features/login/components/RightContent/ResetPassword';
import TherapistRegister from '@/features/login/components/RightContent/TherapistSetPassword';
import Signin from '@/features/therapist/components/Login/RightContent/Signin';

export const RightContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === ROUTES.THERAPIST_LOGIN.path;
  const isForgot = location.pathname === ROUTES.THERAPIST_FORGOT.path;
  const isResetPassword = location.pathname === ROUTES.THERAPIST_RESET_PASSWORD.path;
  const isPasswordChanged = location.pathname === ROUTES.THERAPIST_PASSWORD_CHANGED.path;
  const isRegister = location.pathname === ROUTES.THERAPIST_REGISTER.path;
  return (
    <div className='max-w-438px w-full mx-auto'>
      {isLogin && <Signin />}
      {isForgot && <ForgotPassword role={UserRole.THERAPIST} />}
      {isResetPassword && <ResetPassword />}
      {isPasswordChanged && <PasswordChanged />}
      {isRegister && <TherapistRegister />}
    </div>
  );
};

export default RightContent;
