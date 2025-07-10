import { useLocation } from "react-router-dom";
import Signin from "./Signin";
import { ROUTES } from "@/constants/routePath";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import PasswordChanged from "./PasswordChanged";
import Verification from "./Verification";

export const RightContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === ROUTES.LOGIN.path;
  const isRegister = location.pathname === ROUTES.REGISTER.path;
  const isForgot = location.pathname === ROUTES.FORGOT.path;
  const isResetPassword = location.pathname === ROUTES.RESETPASSWORD.path;
  const isVerification = location.pathname === ROUTES.VERIFICATION.path;
  const isPasswordChanged = location.pathname === ROUTES.PASSWORDCHANGED.path;
  return (
    <div className="max-w-438px w-full mx-auto">
      {isLogin && <Signin />}
      {isRegister && <Register />}
      {isForgot && <ForgotPassword />}
      {isResetPassword && <ResetPassword />}
      {isPasswordChanged && <PasswordChanged />}
      {isVerification && <Verification />}
    </div>
  );
};

export default RightContent;
