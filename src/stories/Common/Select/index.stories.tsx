import { Select } from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: Select,
  title: 'Common/Select',
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

interface OptionType {
  label: string;
  value: string;
}
const options: OptionType[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
  { label: 'Banana', value: 'banana' },
  { label: 'Grapes', value: 'grapes' },
  { label: 'Mango', value: 'mango' },
  { label: 'Pineapple', value: 'pineapple' },
  { label: 'Strawberry', value: 'strawberry' },
];

export const Default: Story = {
  args: {
    StylesConfig: {},
    name: '',
    options: options,
    isDisabled: false,
    isClearable: false,
    isSearchable: false,
  },
};

export const Searchable: Story = {
  args: {
    options,
    isSearchable: true,
  },
};

export const Clearable: Story = {
  args: {
    options,
    isClearable: true,
  },
};
export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const LoadingState: Story = {
  args: {
    options,
    isLoading: true,
  },
};

export const ContainingError: Story = {
  args: {
    options,
    error: 'This is required',
  },
};
export const WithLabel: Story = {
  args: {
    options,
    label: 'Select',
  },
};
export const Required: Story = {
  args: {
    options,
    isRequired: true,
  },
};

export const MultiSelect: Story = {
  args: {
    isMulti: true,
    options: options,
  },
};
