import React, { type JSX, forwardRef, useState } from 'react';

import clsx from 'clsx';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import ReactSelect, {
  type GroupBase,
  type SelectInstance,
  type StylesConfig,
  components as defaultComponents,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';

import type { Appointment } from '@/stories/Common/Calender/types';
import Icon, { type IconNameType } from '@/stories/Common/Icon';
import SectionLoader from '@/stories/Common/Loader/Spinner';
import MultiSelectValueContainer from '@/stories/Common/MultiSelectValueContainer';
import CustomAsyncSelect from '@/stories/Common/Select/CustomAsyncSelect';

export type OptionTypeGlobal = { label?: string; value: string };

export type SelectGroup = GroupBase<OptionTypeGlobal>;
export type DefaultStylesConfig<OptionType> = StylesConfig<
  OptionType,
  boolean,
  GroupBase<OptionType>
>;

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: IconNameType;
  data?: Appointment;
};

export interface ExtraSelectProps {
  leftIcon?: IconNameType;
  leftIconClassname?: string;
}

export interface SelectProps<
  TFieldValues extends FieldValues,
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> extends React.ComponentProps<typeof ReactSelect<Option, IsMulti, Group>>,
    ExtraSelectProps {
  label?: string;
  parentClassName?: string;
  labelClassName?: string;
  error?: string;
  isRequired?: boolean;
  isCreatable?: boolean;
  isMenuIsOpen?: boolean;
  StylesConfig?: StylesConfig<Option, IsMulti, Group>;
  errorClass?: string;
  portalRootId?: string | true;
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  leftIcon?: IconNameType;
  maxSelectedToShow?: number;
}

const CustomIconControl = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  props: React.ComponentProps<typeof defaultComponents.Control<Option, IsMulti, Group>>
) => {
  const { leftIcon, leftIconClassname } = props.selectProps as ExtraSelectProps;

  return (
    <defaultComponents.Control {...props}>
      {leftIcon && <Icon name={leftIcon} className={clsx('', leftIconClassname)} />}
      {props.children}
    </defaultComponents.Control>
  );
};

const CustomDropdownIndicator = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  props: React.ComponentProps<typeof defaultComponents.DropdownIndicator<Option, IsMulti, Group>>
) => {
  return (
    <defaultComponents.DropdownIndicator {...props}>
      <Icon name='dropdownArrow' />
    </defaultComponents.DropdownIndicator>
  );
};

const CustomValueContainer = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  props: React.ComponentProps<typeof defaultComponents.ValueContainer<Option, IsMulti, Group>>
) => {
  const { children, ...rest } = props;

  return (
    <defaultComponents.ValueContainer {...rest}>
      <div className='flex-1 flex items-center min-h-0'>{children}</div>
    </defaultComponents.ValueContainer>
  );
};

export const Select = forwardRef(
  <
    TFieldValues extends FieldValues,
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>,
  >(
    {
      label = '',
      placeholder,
      parentClassName = '',
      labelClassName = '',
      error = '',
      components,
      isRequired = false,
      options = [],
      className,
      onChange,
      onMenuOpen,
      name,
      value,
      isCreatable = false,
      isDisabled = false,
      isClearable = false,
      isSearchable = true,
      isMenuIsOpen,
      StylesConfig: stylesConfigProp,
      onMenuScrollToBottom,
      onMenuClose,
      onInputChange,
      isLoading,
      errorClass,
      filterOption,
      portalRootId,
      getOptionLabel,
      formatOptionLabel,
      menuPlacement,
      control,
      isMulti,
      ...otherProps
    }: SelectProps<TFieldValues, Option, IsMulti, Group>,
    ref: React.LegacyRef<SelectInstance<Option, IsMulti, Group>>
  ) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean | undefined>(isMenuIsOpen);

    const customFilterOption = (
      option: { label?: string; value: unknown },
      rawInput: string
    ): boolean => {
      if (!rawInput) return true;
      const label = option.label ?? '';
      if (typeof label !== 'string') return false;
      return label.toLowerCase().includes(rawInput.trim().toLowerCase());
    };

    const mergedComponents = {
      Control: CustomIconControl,
      DropdownIndicator: CustomDropdownIndicator,
      ValueContainer: isMulti ? MultiSelectValueContainer : CustomValueContainer,
      ...components,
    };

    const customStyles: StylesConfig<Option, IsMulti, Group> = {
      singleValue: (base, state) => ({
        ...base,
        color: '#2E3139',
        width: '100%',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontSize: '18px',
        ...(stylesConfigProp?.singleValue ? stylesConfigProp.singleValue(base, state) : {}),
      }),
      control: (base, state) => ({
        ...base,
        background: '#fff',
        border: '1px solid #E8ECF3',
        borderRadius: '10px',
        '&:hover': { borderColor: '#E8ECF3' },
        outline: state.isFocused
          ? '1px solid #43573C'
          : error
            ? '1px solid red'
            : '1px solid transparent',
        boxShadow: 'none !important',
        ...(isDisabled ? { opacity: '0.5', cursor: 'not-allowed', pointerEvents: 'auto' } : {}),
        ...(stylesConfigProp?.control ? stylesConfigProp.control(base, state) : {}),
      }),
      placeholder: (base, state) => ({
        ...base,
        ...(stylesConfigProp?.placeholder ? stylesConfigProp.placeholder(base, state) : {}),
      }),
      valueContainer: base => ({
        ...base,
        display: 'flex',
        alignItems: 'center',
        minHeight: '38px',
      }),
      input: (base, state) => ({
        ...base,
        color: '#2E3139',
        ...(stylesConfigProp?.input ? stylesConfigProp.input(base, state) : {}),
      }),
      indicatorSeparator: base => ({ ...base, display: 'none' }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: '#2E3139',
        '&:hover': { color: '#2E3139' },
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease-in-out',
        ...(stylesConfigProp?.dropdownIndicator
          ? stylesConfigProp.dropdownIndicator(base, state)
          : {}),
      }),
      menu: (base, state) => ({
        ...base,
        padding: '0px',
        overflow: 'hidden',
        borderRadius: '10px',
        boxShadow: '0px 0px 24px 0px #0000001F',
        ...(stylesConfigProp?.menu ? stylesConfigProp.menu(base, state) : {}),
      }),
      menuList: (base, state) => ({
        ...base,
        padding: '0px',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        ...(stylesConfigProp?.menuList ? stylesConfigProp.menuList(base, state) : {}),
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#43573C'
          : state.isFocused
            ? 'rgba(67, 87, 60, 0.3)'
            : '',
        color: state.isSelected ? '#fff' : '#2E3139',
        '&:hover': {
          backgroundColor: state.isSelected ? '#43573C' : 'rgba(67, 87, 60, 0.3)',
          color: state.isSelected ? '#fff' : '#2E3139',
        },
        padding: '10px 14px',
        fontSize: '14px',
        ...(stylesConfigProp?.option ? stylesConfigProp.option(base, state) : {}),
      }),
      noOptionsMessage: base => ({
        ...base,
      }),
      multiValue: (base, state) => ({
        ...base,
        background: '#2E3139 !important',
        color: 'white',
        borderRadius: '6px',
        ...(stylesConfigProp?.multiValue ? stylesConfigProp.multiValue(base, state) : {}),
      }),
      multiValueLabel: (base, state) => ({
        ...base,
        color: 'white',
        ...(stylesConfigProp?.multiValueLabel ? stylesConfigProp.multiValueLabel(base, state) : {}),
      }),
      multiValueRemove: (base, state) => ({
        ...base,
        background: 'transparent !important',
        color: 'white !important',
        ...(stylesConfigProp?.multiValueRemove
          ? stylesConfigProp.multiValueRemove(base, state)
          : {}),
        ...(isDisabled && { display: 'none' }),
      }),
      loadingIndicator: (base, state) => ({
        ...base,
        ...(stylesConfigProp?.loadingIndicator
          ? stylesConfigProp.loadingIndicator(base, state)
          : {}),
      }),
    };

    const getPortalTarget = () =>
      typeof portalRootId === 'string'
        ? document.getElementById(portalRootId) || undefined
        : typeof portalRootId === 'boolean'
          ? document.body
          : undefined;

    const commonProps = {
      getOptionLabel,
      formatOptionLabel,
      placeholder,
      isLoading,
      loadingMessage: () => <SectionLoader className='relative h-6' size='h-5 w-5 !border-[3px]' />,
      styles: customStyles,
      options,
      name,
      filterOption: filterOption || customFilterOption,
      menuPlacement: menuPlacement || 'auto',
      onMenuClose: () => {
        setIsMenuOpen(false);
        onMenuClose?.();
      },
      onMenuOpen: () => {
        setIsMenuOpen(true);
        onMenuOpen?.();
      },
      onMenuScrollToBottom,
      onInputChange,
      ref,
      components: mergedComponents,
      isDisabled,
      isClearable,
      isSearchable,
      menuIsOpen: isMenuOpen,
      className,
      menuPortalTarget: getPortalTarget(),
      onChange,
      value,
      isMulti,
      onBlur: () => {
        setIsMenuOpen(false); // Close menu on blur
      },
      ...otherProps,
    };

    return (
      <div className={clsx('relative flex flex-col gap-1.5', parentClassName)}>
        {label && (
          <label
            className={clsx(
              'flex items-center gap-1 text-blackdark text-sm font-normal leading-5 whitespace-nowrap',
              labelClassName
            )}
          >
            {label}
            {isRequired && <span className='text-red-500 font-medium'>*</span>}
          </label>
        )}
        <div
          className={clsx(error && 'border-red', 'w-full')}
          ref={ref as React.Ref<HTMLDivElement>}
        >
          {!isCreatable ? (
            <>
              {name && control ? (
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <ReactSelect
                      {...commonProps}
                      onChange={(val, actionMeta) => {
                        field.onChange(val);
                        onChange?.(val, actionMeta);
                      }}
                      value={field.value}
                      closeMenuOnSelect={isMulti ? false : true}
                      menuIsOpen={isMenuOpen}
                      onBlur={() => {
                        setIsMenuOpen(false);
                        field.onBlur();
                      }}
                    />
                  )}
                />
              ) : (
                <ReactSelect
                  {...commonProps}
                  closeMenuOnSelect={isMulti ? false : true}
                  menuIsOpen={isMenuOpen}
                />
              )}
            </>
          ) : (
            <CreatableSelect
              placeholder={placeholder}
              styles={customStyles}
              options={options}
              onMenuOpen={() => {
                setIsMenuOpen(true);
                onMenuOpen?.();
              }}
              onMenuClose={() => {
                setIsMenuOpen(false);
                onMenuClose?.();
              }}
              components={mergedComponents}
              ref={ref}
              onChange={onChange}
              value={value}
              className={className}
              isDisabled={isDisabled}
              isClearable={isClearable}
              menuIsOpen={isMenuOpen}
              menuPortalTarget={getPortalTarget()}
              closeMenuOnSelect={isMulti ? false : true}
              onBlur={() => {
                setIsMenuOpen(false);
              }}
              {...otherProps}
            />
          )}
          {error && <p className={`text-red-500 text-xs mt-1.5 ${errorClass}`}>{error}</p>}
        </div>
      </div>
    );
  }
) as <
  TFieldValues extends FieldValues,
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: SelectProps<TFieldValues, Option, IsMulti, Group>
) => JSX.Element;

export default Select;

export { CustomAsyncSelect };
