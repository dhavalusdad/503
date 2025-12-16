import { useState } from 'react';

import PhoneField from '@/stories/Common/PhoneNumberInput';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof PhoneField> = {
  title: 'Components/PhoneField',
  component: PhoneField,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    isRequired: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    error: { control: 'text' },
    country: { control: 'text' },
    enableSearch: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneField>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value || '');

    return (
      <PhoneField
        {...args}
        value={value}
        onChange={(val, data, event, formattedValue) => {
          console.log('Changed:', val, data, formattedValue);
          setValue(val);
        }}
      />
    );
  },
  args: {
    label: 'Phone Number',
    isRequired: true,
    country: 'in',
    placeholder: 'Enter phone number',
    error: '',
    enableSearch: true,
  },
};
