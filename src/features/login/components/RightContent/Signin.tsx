import { ROUTES } from "@/constants/routePath";
import { Button, Icon } from "@/stories/Common";
import CheckboxField from "@/stories/Common/CheckBox";
import InputField from "@/stories/Common/Input";
import PasswordField from "@/stories/Common/PasswordField";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const navigate = useNavigate();
  return (
    <>
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
          <PasswordField
            label="Password"
            placeholder="Password"
            icon="lock"
            iconFirst
          />
          <div className="flex items-center justify-between">
            <CheckboxField
              id="remember"
              label="Remember Me"
              labelClass="whitespace-nowrap"
            />
            <Button
              variant="none"
              title="Forgot Password?"
              className="font-bold text-primary !p-0"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="filled"
            title="Sign In"
            className="w-full rounded-10px !font-bold !leading-5"
          />
          <div className="relative">
            <div className="h-1px bg-primarylight w-full my-2.5"></div>
            <div className="absolute left-2/4 -translate-x-2/4 bg-white rounded-full px-3.5 -top-0.5">
              <span className="text-xl leading-4">or</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="none"
              title="Google"
              icon={<Icon name="google" />}
              isIconFirst
              parentClassName="w-2/4"
              className="w-full border border-solid border-primarylight rounded-10px !leading-5"
            />
            <Button
              variant="none"
              title="Facebook"
              icon={<Icon name="facebooklogo" />}
              isIconFirst
              parentClassName="w-2/4"
              className="w-full border border-solid border-primarylight rounded-10px !leading-5"
            />
          </div>
        </div>
      </div>
      <p className="text-center mt-6 text-blackdark text-sm font-normal">
        Don’t have an Account?{" "}
        <span
          className="font-bold cursor-pointer"
          onClick={() => navigate(ROUTES.REGISTER.path)}
        >
          Sign Up
        </span>
      </p>
    </>
  );
};

export default Signin;
