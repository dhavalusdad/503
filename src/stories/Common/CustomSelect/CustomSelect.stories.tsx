import { useState } from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import CustomSelect, { type CustomSelectProps, type SelectOption } from "./index";
import "../../../index.css"; // Import the main CSS file with Tailwind

const meta: Meta<typeof CustomSelect> = {
  title: "Common/CustomSelect",
  component: CustomSelect,
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" },
  },
};

export default meta;

type Story = StoryObj<typeof CustomSelect>;

const baseOptions: SelectOption[] = [
  { value: "apple", label: "Apple", icon: "dashboard" },
  { value: "banana", label: "Banana", icon: "client" },
  { value: "grape", label: "Grape", icon: "appointment" },
  { value: "orange", label: "Orange", icon: "calendar" },
  { value: "mango", label: "Mango", icon: "chat" },
  { value: "pineapple", label: "Pineapple", icon: "settings" },
  { value: "watermelon", label: "Watermelon", icon: "mail" },
];

const Template = (args: CustomSelectProps) => {
  const [value, setValue] = useState<SelectOption | SelectOption[] | null>(
    args.value || null
  );

  return (
    <div className="w-[300px]">
      <CustomSelect
        {...args}
        value={value}
        onChange={(val) => {
          setValue(val);
          args.onChange?.(val);
        }}
      />
    </div>
  );
};


export const Default: Story = {
  render: Template,
  args: {
    label: "Choose a fruit",
    options: baseOptions,
    placeholder: "Select a fruit",
  },
};

export const MultiSelect: Story = {
  render: Template,
  args: {
    label: "Select multiple fruits",
    isMulti: true,
    options: baseOptions,
  },
};

export const WithIcons: Story = {
  render: Template,
  args: {
    label: "With Icons",
    options: baseOptions,
    showIcons: true,
    placeholder: "Pick something",
  },
};

export const MultiWithIconsAndMaxChips: Story = {
  render: Template,
  args: {
    label: "Max 3 Chips",
    isMulti: true,
    showIcons: true,
    maxChips: 3,
    moreChipsText: "others",
    options: baseOptions,
    value: baseOptions.slice(0, 5),
  },
};

export const Clearable: Story = {
  render: Template,
  args: {
    label: "Clearable Select",
    isClearable: true,
    options: baseOptions,
    value: baseOptions[0],
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    label: "Disabled Select",
    isDisabled: true,
    options: baseOptions,
    value: baseOptions[0],
  },
};

export const WithError: Story = {
  render: Template,
  args: {
    label: "Select with error",
    options: baseOptions,
    error: "Please select at least one option",
  },
};

export const RequiredField: Story = {
  render: Template,
  args: {
    label: "Required Field",
    isRequired: true,
    options: baseOptions,
  },
};

export const NoSearch: Story = {
  render: Template,
  args: {
    label: "Non-searchable",
    isSearchable: false,
    options: baseOptions,
  },
};
