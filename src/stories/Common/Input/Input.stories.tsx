import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Input from './index';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    type: {
      control: { type: 'select' },
      options: [
        'text',
        'password',
        'number',
        'checkbox',
        'radio',
      ],
    },
    placeholder: { control: 'text' },
    name: { control: 'text' },
    disabled: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

const Template = (args: any) => {
  const [val, setVal] = useState(
    args.type === 'checkbox' || args.type === 'radio' ? false : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      args.type === 'checkbox' || args.type === 'radio'
        ? e.target.checked
        : e.target.value;
    setVal(value);
  };

  return <Input {...args} value={val} onChange={handleChange} />;
};


export const TextInput: Story = {
  render: Template,
  args: {
    label: 'Text',
    type: 'text',
    placeholder: 'Enter text',
  },
};

export const PasswordInput: Story = {
  render: Template,
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const NumberInput: Story = {
  render: Template,
  args: {
    label: 'Number',
    type: 'number',
    placeholder: 'Enter number',
  },
};


export const CheckboxInput: Story = {
  render: Template,
  args: {
    label: 'Accept Terms',
    type: 'checkbox',
  },
};

export const RadioInput: Story = {
  render: Template,
  args: {
    label: 'Select Option',
    type: 'radio',
    name: 'group1',
  },
};


