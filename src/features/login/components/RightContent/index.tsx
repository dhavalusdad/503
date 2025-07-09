import { Icon } from "@/stories/Common";
import InputField from "@/stories/Common/Input";
import PasswordField from "@/stories/Common/PasswordField";

export const RightContent = () => {
  return (
    <div className="max-w-438px w-full mx-auto">
      <div className="flex flex-col gap-30px">
        <Icon name="logosecondary" />
        <div className="flex flex-col gap-2.5">
          <h4 className="text-2xl font-bold text-blackdark">
            Sign In to your Account
          </h4>
          <p className="text-base font-normal text-primarygray">
            Welcome Back! Please Enter Your Detail
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <InputField
            type="email"
            label="Email"
            placeholder="Email"
            icon="email"
            iconFirst
          />
          <PasswordField label="Password" placeholder="Password" />
        </div>
      </div>
    </div>
  );
};

export default RightContent;
