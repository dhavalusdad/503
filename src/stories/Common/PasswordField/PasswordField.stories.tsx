import type { Meta, StoryObj } from '@storybook/react';
import PasswordField from './index'; 

const meta: Meta<typeof PasswordField> = {
  title: 'Common/PasswordField',
  component: PasswordField,
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter your password',
    autoComplete: 'new-password',
  },
};

export default meta;
type Story = StoryObj<typeof PasswordField>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Password',
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    isRequired: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    isRequired: true,
    error: 'Password is too short',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Password',
    isDisabled: true,
    value: 'secret123',
  },
};

export const CustomStyled: Story = {
  args: {
    label: 'Styled Password',
    inputClass: 'bg-yellow-50 border-yellow-400',
    labelClass: 'text-yellow-700',
    parentClassName: 'mb-4',
  },
};
