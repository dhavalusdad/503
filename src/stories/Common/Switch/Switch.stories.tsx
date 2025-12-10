import Switch from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Label displayed next to the switch' },
    parentClassName: { control: 'text', description: 'Custom class for the parent container' },
    labelClassName: { control: 'text', description: 'Custom class for the label text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the switch',
    },
    error: { control: 'text', description: 'Error message displayed below the switch' },
    isLabelFirst: {
      control: 'boolean',
      description: 'Whether the label should appear before the switch',
    },
    isChecked: { control: 'boolean', description: 'Switch checked state' },
    isDisabled: { control: 'boolean', description: 'Disable the switch' },
    isCustomSwitch: {
      control: 'boolean',
      description: 'Use custom switch styling without onChange handler',
    },
    isWatchRegister: {
      control: 'boolean',
      description: 'Special mode for watch/register forms',
    },
    inputClassName: { control: 'text', description: 'Custom class for the input element' },
    checkWrapClassName: { control: 'text', description: 'Custom class for the switch track' },
    onChange: { action: 'changed', description: 'Callback when switch value changes' },
    onBlur: { action: 'blurred', description: 'Callback when input loses focus' },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Enable notifications',
    size: 'md',
    isChecked: false,
    isLabelFirst: false,
    isDisabled: false,
    isCustomSwitch: false,
    isWatchRegister: false,
    error: '',
  },
};

export const Checked: Story = {
  args: {
    label: 'Enable notifications',
    isChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Enable notifications',
    isDisabled: true,
    isChecked: false,
  },
};

export const WithError: Story = {
  args: {
    label: 'Enable notifications',
    isChecked: false,
    error: 'This field is required',
  },
};

export const LabelFirst: Story = {
  args: {
    label: 'Enable notifications',
    isLabelFirst: true,
    isChecked: false,
  },
};
