import { Icon } from "@/stories/Common";

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
          <p>email Input With Label</p>
          <p>Password Input With Label</p>
        </div>
      </div>
    </div>
  );
};

export default RightContent;
