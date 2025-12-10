import { useState } from 'react';

import { type MultiValue } from 'react-select';

import MultiSelectValueContainer from '.';

import type { Meta, StoryObj } from '@storybook/react';
import Select from '../Select';

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

const meta: Meta<typeof MultiSelectValueContainer> = {
  title: 'Components/MultiSelectValueContainer',
  component: MultiSelectValueContainer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MultiSelectValueContainer>;

// Playground story to demonstrate multi-select with +N more
export const MultiSelectWithMore: Story = {
  render: () => {
    const [selected, setSelected] = useState<MultiValue<OptionType>>([
      options[0],
      options[1],
      options[2],
      options[3],
      options[4],
    ]);

    return (
      <div style={{ width: 800 }}>
        <Select
          options={options}
          isMulti
          value={selected}
          onChange={setSelected}
          components={{
            ValueContainer: MultiSelectValueContainer,
          }}
          maxSelectedToShow={2}
          className='w-full'
          parentClassName='w-full'
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the custom MultiSelectValueContainer. When more than `maxSelectedToShow` items are selected, the extra count is displayed as "+N more".',
      },
    },
  },
};
