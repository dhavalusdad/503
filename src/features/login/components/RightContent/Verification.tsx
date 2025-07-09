import { ROUTES } from "@/constants/routePath";
import { Button, Icon } from "@/stories/Common";
import InputField from "@/stories/Common/Input";
import { useNavigate } from "react-router-dom";

const Verification = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col gap-30px">
        <Icon name="logosecondary" />
        <div className="flex flex-col gap-2.5">
          <h4 className="text-2xl font-bold text-blackdark">
            Two-step Authentication
          </h4>
          <p className="text-base font-normal text-primarygray">
            Please enter the OTP to verify your account. A Code has been sent to
            <span>r*****************8@gmail.com</span>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <InputField
            type="text"
            inputClass="text-center border-surface text-xl"
          />
          <InputField
            type="text"
            inputClass="text-center border-surface text-xl"
          />
          <InputField
            type="text"
            inputClass="text-center border-surface text-xl"
          />
          <InputField
            type="text"
            inputClass="text-center border-surface text-xl"
          />
          <InputField
            type="text"
            inputClass="text-center border-surface text-xl"
          />
          <InputField
            type="text"
            inputClass="text-center border-surface text-xl"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="filled"
            title="Verify Code"
            className="w-full rounded-10px !font-bold !leading-5"
            onClick={() => navigate(ROUTES.RESETPASSWORD.path)}
          />
        </div>
      </div>
      <p className="text-center mt-6 text-blackdark text-sm font-normal">
        Didn’t get the code?{" "}
        <span className="font-bold cursor-pointer">Resend Code</span>
      </p>
    </>
  );
};

export default Verification;
