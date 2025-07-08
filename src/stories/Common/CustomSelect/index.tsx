import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Icon } from "@/stories/Common";
import type { IconNameType } from "@/stories/Common";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: IconNameType;
};

export interface CustomSelectProps {
  options: SelectOption[];
  value?: SelectOption | SelectOption[] | null;
  onChange?: (value: SelectOption | SelectOption[] | null) => void;
  placeholder?: string;
  label?: string;
  isMulti?: boolean;
  isDisabled?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isRequired?: boolean;
  error?: string;
  className?: string;
  parentClassName?: string;
  labelClassName?: string;
  errorClass?: string;
  showIcons?: boolean;
  iconClassName?: string;
  maxChips?: number;
  moreChipsText?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  label,
  isMulti = false,
  isDisabled = false,
  isClearable = false,
  isSearchable = true,
  isRequired = false,
  error,
  className = "",
  parentClassName = "",
  labelClassName = "",
  errorClass = "",
  showIcons = false,
  iconClassName = "",
  maxChips,
  moreChipsText = "more",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedOptions(Array.isArray(value) ? value : [value]);
    } else {
      setSelectedOptions([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedOptions.some((selected) => selected.value === option.value)
  );

  const handleOptionSelect = (option: SelectOption) => {
    if (isDisabled || option.disabled) return;

    let newSelectedOptions: SelectOption[];

    if (isMulti) {
      const isAlreadySelected = selectedOptions.some(
        (selected) => selected.value === option.value
      );
      newSelectedOptions = isAlreadySelected
        ? selectedOptions.filter((selected) => selected.value !== option.value)
        : [...selectedOptions, option];
    } else {
      newSelectedOptions = [option];
      setIsOpen(false);
      setSearchTerm("");
    }

    setSelectedOptions(newSelectedOptions);
    onChange?.(isMulti ? newSelectedOptions : newSelectedOptions[0]);
  };

  const handleOptionRemove = (optionToRemove: SelectOption) => {
    const newSelectedOptions = selectedOptions.filter(
      (option) => option.value !== optionToRemove.value
    );
    setSelectedOptions(newSelectedOptions);
    onChange?.(isMulti ? newSelectedOptions : null);
  };

  const handleClear = () => {
    setSelectedOptions([]);
    onChange?.(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleToggle = () => {
    if (isDisabled) return;
    setIsOpen(!isOpen);
    if (!isOpen && isSearchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 ${parentClassName}`}>
      {label && (
        <label
          className={`flex items-center gap-1 text-base font-normal leading-5 whitespace-nowrap ${labelClassName}`}
        >
          {label}
          {isRequired && <span className="text-red-500 font-medium">*</span>}
        </label>
      )}

      <div ref={containerRef} className={clsx("relative w-full", className)}>
        <div
          className={clsx(
            "relative min-h-[40px] px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer transition-all duration-200",
            "hover:border-gray-300",
            isOpen && "outline outline-blue-400",
            error && "border-red-500",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleToggle}
        >
          <div className="flex flex-wrap gap-1 min-h-[20px]">
                         {selectedOptions.length > 0 ? (
               isMulti ? (
                 <>
                   {/* Display chips up to maxChips limit */}
                   {selectedOptions
                     .slice(0, maxChips || selectedOptions.length)
                     .map((option) => (
                       <div
                         key={option.value}
                         className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded bg-blue-500 text-white pr-1"
                       >
                         {showIcons && option.icon && (
                           <Icon
                             name={option.icon}
                             className={`${iconClassName} flex-shrink-0`}
                             fill="currentColor"
                           />
                         )}
                         <span className="truncate max-w-[120px]">
                           {option.label}
                         </span>
                         <button
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleOptionRemove(option);
                           }}
                           className="ml-1 hover:bg-blue-400 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                         >
                           ×
                         </button>
                       </div>
                     ))}
                   
                   {/* Show "+n more" indicator if there are more selected options than maxChips */}
                   {maxChips && selectedOptions.length > maxChips && (
                     <div className="inline-flex items-center px-2 py-1 text-sm rounded bg-gray-200 text-gray-700">
                       +{selectedOptions.length - maxChips} {moreChipsText}
                     </div>
                   )}
                 </>
               ) : (
                <div className="w-full flex items-center gap-2 text-gray-900">
                  {showIcons && selectedOptions[0].icon && (
                    <Icon
                      name={selectedOptions[0].icon}
                      className={`${iconClassName} flex-shrink-0`}
                      fill="currentColor"
                    />
                  )}
                  <span className="truncate">{selectedOptions[0].label}</span>
                </div>
              )
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>

          {isClearable && selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className={clsx(
                "w-4 h-4 text-gray-800 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {isSearchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  placeholder="Search..."
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={clsx(
                      "px-3 py-2 cursor-pointer text-sm transition-colors duration-150 flex items-center gap-2",
                      "hover:bg-blue-100",
                      selectedOptions.some(
                        (selected) => selected.value === option.value
                      ) && "bg-blue-300 text-white hover:bg-blue-300",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {showIcons && option.icon && (
                      <Icon
                        name={option.icon}
                        className={`${iconClassName} flex-shrink-0`}
                        fill="currentColor"
                      />
                    )}
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className={`text-red-500 text-xs mt-1.5 ${errorClass}`}>{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;
