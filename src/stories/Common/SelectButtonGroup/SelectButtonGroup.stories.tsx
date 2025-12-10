import { useState } from 'react';

import SelectButtonGroup from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/SelectButtonGroup',
  component: SelectButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected value from the button group.',
    },
    onChange: {
      action: 'changed',
      description: 'Callback triggered when a button is clicked, returning the selected value.',
    },
    options: {
      control: 'object',
      description:
        'Array of options to render as buttons. Each option contains a `label` and `value`.',
    },
    disabled: {
      control: 'boolean',
      description: 'If true, disables all buttons and prevents interaction.',
    },
  },
} satisfies Meta<typeof SelectButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [selected, setSelected] = useState('option1');
    return (
      <SelectButtonGroup
        {...args}
        value={selected}
        onChange={val => {
          setSelected(val);
          args.onChange?.(val);
        }}
      />
    );
  },
  args: {
    value: 'option1', // ✅ Added to satisfy type requirement
    onChange: () => {}, // ✅ Added placeholder handler
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
};

export const Disabled: Story = {
  render: args => {
    const [selected, setSelected] = useState('option2');
    return <SelectButtonGroup {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    value: 'option2',
    onChange: () => {},
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    disabled: true,
  },
};

export const PreSelected: Story = {
  render: args => {
    const [selected, setSelected] = useState('option3');
    return <SelectButtonGroup {...args} value={selected} onChange={setSelected} />;
  },
  args: {
    value: 'option3',
    onChange: () => {},
    options: [
      { value: 'option1', label: 'Low' },
      { value: 'option2', label: 'Medium' },
      { value: 'option3', label: 'High' },
    ],
  },
};
