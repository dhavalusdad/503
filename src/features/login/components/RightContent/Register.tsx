import { ROUTES } from "@/constants/routePath";
import { Button, Icon } from "@/stories/Common";
import CheckboxField from "@/stories/Common/CheckBox";
import InputField from "@/stories/Common/Input";
import PasswordField from "@/stories/Common/PasswordField";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col gap-30px">
        <Icon name="logosecondary" />
        <div className="flex flex-col gap-2.5">
          <h4 className="text-2xl font-bold text-blackdark">Get Started Now</h4>
          <p className="text-base font-normal text-primarygray">
            Let’s create your account
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <InputField
              type="text"
              label="First Name"
              icon="user"
              iconFirst
              placeholder="First Name"
              parentClassName="w-2/4"
            />
            <InputField
              type="text"
              label="Last Name"
              icon="user"
              iconFirst
              placeholder="Last Name"
              parentClassName="w-2/4"
            />
          </div>
          <PasswordField
            label="Create Password"
            placeholder="Create Password"
            icon="lock"
            iconFirst
          />
          <PasswordField
            label="Confirm Password"
            placeholder="Confirm Password"
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
              onClick={() => navigate(ROUTES.FORGOT.path)}
            />
          </div>
          <ul className="flex flex-col gap-2.5">
            <li className="flex items-center gap-2 text-Red text-sm font-normal leading-3.5">
              <Icon
                name="invalidcross"
                className="icon-wrapper w-18px h-18px"
              />
              <span>At least 8 characters</span>
            </li>
            <li className="flex items-center gap-2 text-Red text-sm font-normal leading-3.5">
              <Icon
                name="invalidcross"
                className="icon-wrapper w-18px h-18px"
              />
              <span>Contains one lowercase letter</span>
            </li>
            <li className="flex items-center gap-2 text-Green text-sm font-normal leading-3.5">
              <Icon name="validcheck" className="icon-wrapper w-18px h-18px" />
              <span>Contains one uppercase letter</span>
            </li>
            <li className="flex items-center gap-2 text-Green text-sm font-normal leading-3.5">
              <Icon name="validcheck" className="icon-wrapper w-18px h-18px" />
              <span>Contain one number</span>
            </li>
            <li className="flex items-center gap-2 text-Green text-sm font-normal leading-3.5">
              <Icon name="validcheck" className="icon-wrapper w-18px h-18px" />
              <span>Contain one special character (@,#,$,%, etc.)</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="filled"
            title="Sign Up"
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
        Already have an Account?{" "}
        <span className="font-bold cursor-pointer">Sign In</span>
      </p>
    </>
  );
};

export default Register;
