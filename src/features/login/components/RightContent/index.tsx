import { useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routePath';
import ForgotPassword from '@/features/login/components/RightContent/ForgotPassword';
import PasswordChanged from '@/features/login/components/RightContent/PasswordChanged';
import Register from '@/features/login/components/RightContent/Register';
import ResetPassword from '@/features/login/components/RightContent/ResetPassword';
import SetPassword from '@/features/login/components/RightContent/SetPassword';
import Signin from '@/features/login/components/RightContent/Signin';
import Verification from '@/features/login/components/RightContent/Verification';

export const RightContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === ROUTES.LOGIN.path;
  const isRegister = location.pathname === ROUTES.REGISTER.path;
  const isForgot = location.pathname === ROUTES.FORGOT.path;
  const isResetPassword = location.pathname === ROUTES.RESET_PASSWORD.path;
  const isVerification = location.pathname === ROUTES.VERIFICATION.path;
  const isPasswordChanged = location.pathname === ROUTES.PASSWORD_CHANGED.path;
  const isSetPassword = location.pathname === ROUTES.SET_PASSWORD.path;
  return (
    <div className='max-w-438px w-full m-auto'>
      {isLogin && <Signin />}
      {isRegister && <Register />}
      {isForgot && <ForgotPassword />}
      {isResetPassword && <ResetPassword />}
      {isPasswordChanged && <PasswordChanged />}
      {isVerification && <Verification />}
      {isSetPassword && <SetPassword />}
    </div>
  );
};

export default RightContent;
