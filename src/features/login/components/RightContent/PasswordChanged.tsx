import { ROUTES } from "@/constants/routePath";
import { Button, Icon } from "@/stories/Common";
import { useNavigate } from "react-router-dom";

const PasswordChanged = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col gap-30px">
        <div className="text-center">
          <Icon name="tickcircle" className="inline-block text-Green" />
        </div>
        <div className="flex flex-col gap-2.5 text-center">
          <h4 className="text-2xl font-bold text-blackdark">
            Password Changed!
          </h4>
          <p className="text-base font-normal text-primarygray">
            Your password has been changed successfully. Use your new password
            to Log In.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="filled"
            title="Go Home"
            className="w-full rounded-10px !font-bold !leading-5"
            onClick={() => navigate(ROUTES.DEFAULT.path)}
          />
        </div>
      </div>
    </>
  );
};

export default PasswordChanged;
