import type { Meta, StoryObj } from '@storybook/react';
import CheckboxField from './index'; 

const meta: Meta<typeof CheckboxField> = {
  title: 'Common/CheckboxField',
  component: CheckboxField,
  tags: ['autodocs'],
  args: {
    id: 'example-checkbox',
    label: 'Accept terms and conditions',
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxField>;

export const Default: Story = {};

export const DefaultChecked: Story = {
  args: {
    isDefaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    isChecked: true,
  },
};

export const LabelStart: Story = {
  args: {
    labelPlacement: 'start',
  },
};

export const CustomLabel: Story = {
  args: {
    label: (
      <span>
        I agree to the <a href="#" className="text-blue-600 underline">Privacy Policy</a>
      </span>
    ),
  },
};

export const StyledCheckbox: Story = {
  args: {
    className: 'border-red-500',
    labelClass: 'text-red-600 font-bold',
    parentClassName: 'mb-4',
  },
};
