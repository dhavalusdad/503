import { ROUTES } from "@/constants/routePath";
import { Button, Icon } from "@/stories/Common";
import InputField from "@/stories/Common/Input";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col gap-30px">
        <Icon name="logosecondary" />
        <div className="flex flex-col gap-2.5">
          <h4 className="text-2xl font-bold text-blackdark">Forgot Password</h4>
          <p className="text-base font-normal text-primarygray">
            Enter your registered email or phone number. We'll send a One-Time
            Passcode (OTP) to verify.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <InputField
            type="text"
            label="Email"
            icon="email"
            iconFirst
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="filled"
            title="Send Reset Link"
            className="w-full rounded-10px !font-bold !leading-5"
            onClick={() => navigate(ROUTES.VERIFICATION.path)}
          />
        </div>
      </div>
      <p className="text-center mt-6 text-blackdark text-sm font-normal">
        Back to <span className="font-bold cursor-pointer">Log In</span>
      </p>
    </>
  );
};

export default ForgotPassword;
