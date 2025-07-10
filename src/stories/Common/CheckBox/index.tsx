import clsx from "clsx";
import React from "react";

interface CheckboxProps {
  id: string;
  label: string | React.ReactNode;
  isChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  labelPlacement?: "start" | "end";
  name?: string;
  value?: string;
  isDefaultChecked?: boolean;
  labelClass?: string;
  parentClassName?: string;
  isDisabled?: boolean;
}

export const CheckboxField: React.FC<CheckboxProps> = ({
  id,
  label,
  isChecked,
  isDefaultChecked,
  isDisabled = false,
  onChange,
  className,
  labelPlacement = "end",
  name,
  value,
  labelClass,
  parentClassName,
}) => {
  const renderLabel = () =>
    label ? (
      <label
        htmlFor={id}
        className={clsx(
          "text-sm text-blackdark leading-5 cursor-pointer w-[calc(100%-30px)]",
          labelClass
        )}
      >
        {label}
      </label>
    ) : null;
  return (
    <div
      className={`relative inline-flex items-center gap-2 ${parentClassName}`}
    >
      {labelPlacement === "start" && renderLabel()}
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        disabled={isDisabled}
        checked={isChecked}
        onChange={onChange}
        className={clsx(
          "checkbox_icon h-18px w-18px appearance-none border-2 border-primary rounded cursor-pointer checked:bg-primary checked:border-primary relative checked:before:absolute checked:before:left-1/2 checked:before:top-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:text-lg",
          className,
          { "opacity-50 !cursor-not-allowed": isDisabled }
        )}
        defaultChecked={isDefaultChecked}
      />
      {labelPlacement === "end" && renderLabel()}
    </div>
  );
};

export default CheckboxField;
