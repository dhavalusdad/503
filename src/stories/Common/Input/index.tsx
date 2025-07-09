import clsx from "clsx";
import {
  type ChangeEventHandler,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
} from "react";
import Icon, { type IconNameType } from "@/stories/Common/Icon";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type: HTMLInputTypeAttribute;
  label?: string;
  labelClass?: string;
  isRequired?: boolean;
  icon?: IconNameType;
  onIconClick?: () => void;
  inputClass?: string;
  parentClassName?: string;
  inputParentClassName?: string;
  value?: string | number;
  isDisabled?: boolean;
  error?: string;
  errorClass?: string;
  iconClassName?: string;
  iconFirst?: boolean;
}

export default function InputField({
  onChange,
  placeholder,
  type,
  label,
  labelClass,
  isRequired,
  icon,
  onIconClick,
  inputClass,
  parentClassName,
  inputParentClassName,
  value,
  isDisabled = false,
  error,
  errorClass,
  iconClassName,
  autoComplete = "off",
  iconFirst = false,
  ...otherProps
}: InputFieldProps) {
  return (
    <div className={clsx("relative", parentClassName)}>
      {label && (
        <label
          className={clsx(
            "text-blackdark text-sm font-normal mb-1.5 block leading-5",
            labelClass
          )}
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={clsx("relative", inputParentClassName)}>
        <input
          type={type}
          disabled={isDisabled}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          {...otherProps}
          className={clsx(
            "w-full p-3.5 border border-solid border-primarylight rounded-10px text-sm text-blackdark placeholder:text-primarygray focus:outline-1 focus:outline-primary transition-all ease-in-out duration-300",
            iconFirst ? "pl-11" : "",
            inputClass,
            {
              "border-red-500": error,
              "opacity-50 cursor-not-allowed": isDisabled,
            }
          )}
        />
        {icon && (
          <div
            className={clsx(
              "absolute  top-1/2 transform -translate-y-1/2 text-primarygray cursor-pointer",
              iconFirst ? "left-3" : "right-3",
              iconClassName
            )}
            onClick={onIconClick}
          >
            <Icon name={icon} />
          </div>
        )}
        {error && (
          <p className={clsx("text-xs text-red-500 mt-1", errorClass)}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
