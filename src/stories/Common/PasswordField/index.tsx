import InputField, { type InputFieldProps } from "@/stories/Common/Input";
import clsx from "clsx";
import { useState, type ChangeEventHandler } from "react";
import Icon from "../Icon";

interface PasswordFieldProps extends InputFieldProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  label?: string;
  labelClass?: string;
  inputClass?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  parentClassName?: string;
  lastIconparentClassName?: string;
  lastIconClassName?: string;
}

export const PasswordField = (props: Omit<PasswordFieldProps, "type">) => {
  const [show, setShow] = useState(false);

  const { lastIconClassName, lastIconparentClassName, ...restProps } = props;

  return (
    <div className="relative">
      <InputField
        {...restProps}
        type={show ? "text" : "password"}
        autoComplete={props.autoComplete || "new-password"}
        inputClass={props.inputClass}
        className="relative"
      />
      <div
        className={clsx(
          "absolute right-3 -mt-35px text-primarygray cursor-pointer",
          lastIconparentClassName
        )}
        onClick={() => setShow((prev) => !prev)}
      >
        <Icon
          name={show ? "passwordVisible" : "passwordEye"}
          className={clsx("icon-wrapper w-5 h-5", lastIconClassName)}
        />
      </div>
    </div>
  );
};

export default PasswordField;
