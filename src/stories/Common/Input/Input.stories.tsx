import { InputField } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof InputField> = {
  title: 'Common/Input',
  component: InputField,
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter text',
    type: 'text',
  },
};

export default meta;
type Story = StoryObj<typeof InputField>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Username',
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    isRequired: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    icon: 'search',
    onIconClick: () => alert('Icon clicked'),
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    error: 'Username is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    isDisabled: true,
    value: 'Readonly content',
  },
};

export const WithCustomClasses: Story = {
  args: {
    label: 'Custom Styled Input',
    inputClass: 'border-green-500 bg-green-50',
    parentClassName: 'mb-4',
    labelClass: 'text-green-700',
    icon: 'search',
  },
};

export const Password: Story = {
  args: {
    viewPasswordIcon: true,
    type: 'password',
  },
};

export const Max5Length: Story = {
  args: {
    maxLength: 5,
  },
};
