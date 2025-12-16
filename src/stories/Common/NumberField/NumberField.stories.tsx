import { type Meta, type StoryObj } from '@storybook/react';

import { NumberField } from '@/stories/Common/NumberField';

const meta: Meta<typeof NumberField> = {
  title: 'Common/NumberField',
  component: NumberField,
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter number',
  },
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Age',
  },
};

export const Required: Story = {
  args: {
    label: 'Phone Number',
    isRequired: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'PIN Code',
    error: 'PIN Code is required',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Number',
    isDisabled: true,
    value: '12345',
  },
};

export const WithCustomClasses: Story = {
  args: {
    label: 'Custom Styled Number',
    inputClass: 'border-blue-500 bg-blue-50',
    parentClassName: 'mb-4',
    labelClass: 'text-blue-700',
  },
};

export const Max5Length: Story = {
  args: {
    maxLength: 5,
  },
};
