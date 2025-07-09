import React from "react";
import "react-datepicker/dist/react-datepicker.css";

type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string | boolean | Date;
  checked?: boolean; 
  onChange?: any;
  name?: string;
  disabled?: boolean;
  className?: string;
  childClassName?:string;
};

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  checked,
  onChange,
  name,
  disabled = false,
  childClassName='',
  className = "",
}) => {
  const isCheckboxOrRadio = type === "checkbox" || type === "radio";


  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={!isCheckboxOrRadio ? (value as string) : undefined}
          checked={isCheckboxOrRadio ? checked : undefined} // ✅ use checked if checkbox/radio
          onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          disabled={disabled}
          className={`${isCheckboxOrRadio ? "w-5 h-5" : "px-4 py-2"
            }    border-gray-300   rounded-md border  disabled:bg-gray-100  ${childClassName}`}
        />

    </div>
  );
};

export default Input;
