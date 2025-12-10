import { useLocation } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import Signin from '@/features/admin/components/Login/RightContent/Signin';
import ForgotPassword from '@/features/login/components/RightContent/ForgotPassword';
import PasswordChanged from '@/features/login/components/RightContent/PasswordChanged';
import ResetPassword from '@/features/login/components/RightContent/ResetPassword';
import SetPassword from '@/features/login/components/RightContent/SetPassword';
// import Verifica tion from '@/features/login/components/RightContent/Verification';

export const RightContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === ROUTES.ADMIN_LOGIN.path;
  const isForgot = location.pathname === ROUTES.ADMIN_FORGOT.path;
  const isResetPassword = location.pathname === ROUTES.ADMIN_RESET_PASSWORD.path;
  // const isVerification = location.pathname === ROUTES.ADMIN_VERIFICATION.path;
  const isPasswordChanged = location.pathname === ROUTES.ADMIN_PASSWORD_CHANGED.path;
  const isSetPassword = location.pathname === ROUTES.SET_STAFF_PASSWORD.path;
  return (
    <div className='max-w-498px w-full mx-auto p-3 sm:p-30px shadow-dropdown rounded-20px bg-white'>
      {isLogin && <Signin />}
      {isForgot && <ForgotPassword role={UserRole.ADMIN} />}
      {isResetPassword && <ResetPassword />}
      {isPasswordChanged && <PasswordChanged />}
      {/* {isVerification && <Verification />} */}
      {isSetPassword && <SetPassword />}
    </div>
  );
};

export default RightContent;
