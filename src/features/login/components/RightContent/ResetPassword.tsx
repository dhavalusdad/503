import { ROUTES } from "@/constants/routePath";
import { Button, Icon } from "@/stories/Common";
import PasswordField from "@/stories/Common/PasswordField";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col gap-30px">
        <Icon name="logosecondary" />
        <div className="flex flex-col gap-2.5">
          <h4 className="text-2xl font-bold text-blackdark">
            Set New Password
          </h4>
          <p className="text-base font-normal text-primarygray">
            Enter and confirm your new password below.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <PasswordField
            label="New Password"
            placeholder="New Password"
            icon="lock"
            iconFirst
          />
          <PasswordField
            label="Confirm Password"
            placeholder="Confirm Password"
            icon="lock"
            iconFirst
          />
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
            title="Reset Password"
            className="w-full rounded-10px !font-bold !leading-5"
            onClick={() => navigate(ROUTES.PASSWORDCHANGED.path)}
          />
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
