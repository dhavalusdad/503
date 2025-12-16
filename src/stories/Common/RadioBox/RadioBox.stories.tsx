import { useState } from 'react';

import RadioField from '@/stories/Common/RadioBox';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RadioField> = {
  title: 'Common/RadioBox',
  component: RadioField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A customizable radio button component supporting various label positions, states (checked, disabled, etc.), 
and controlled/uncontrolled behavior.
        `,
      },
    },
  },
  argTypes: {
    id: {
      control: 'text',
      description: 'Unique identifier for the radio input.',
    },
    label: {
      control: 'text',
      description: 'Label displayed next to the radio button.',
    },
    labelPlacement: {
      control: { type: 'radio' },
      options: ['start', 'end'],
      description: 'Position of the label relative to the radio button.',
    },
    isChecked: {
      control: 'boolean',
      description: 'Whether the radio button is checked (controlled mode).',
    },
    isDefaultChecked: {
      control: 'boolean',
      description: 'Whether the radio button is checked by default (uncontrolled mode).',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disables interaction with the radio button.',
    },
    onChange: {
      action: 'changed',
      description: 'Callback triggered when the radio selection changes.',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioField>;

export const Default: Story = {
  args: {
    id: 'radio1',
    label: 'Default Radio',
  },
};

export const Checked: Story = {
  args: {
    id: 'radio2',
    label: 'Checked Radio',
    isChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'radio3',
    label: 'Disabled Radio',
    isDisabled: true,
  },
};

export const LabelStart: Story = {
  args: {
    id: 'radio4',
    label: 'Label on Left',
    labelPlacement: 'start',
  },
};

export const DefaultChecked: Story = {
  args: {
    id: 'radio5',
    label: 'Default Checked',
    isDefaultChecked: true,
  },
};

export const RadioGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState('option1');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelected(e.target.value);
    };

    return (
      <div className='flex flex-col gap-3'>
        <RadioField
          id='option1'
          name='group'
          label='Option 1'
          value='option1'
          isChecked={selected === 'option1'}
          onChange={handleChange}
        />
        <RadioField
          id='option2'
          name='group'
          label='Option 2'
          value='option2'
          isChecked={selected === 'option2'}
          onChange={handleChange}
        />
        <RadioField
          id='option3'
          name='group'
          label='Option 3'
          value='option3'
          isChecked={selected === 'option3'}
          onChange={handleChange}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'A group of radio buttons demonstrating how the component can be used in a controlled state.',
      },
    },
  },
};
