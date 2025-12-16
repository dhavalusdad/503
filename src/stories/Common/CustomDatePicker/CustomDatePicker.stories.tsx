import { useState } from 'react';

import CustomDatePicker from '@/stories/Common/CustomDatePicker';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CustomDatePicker> = {
  title: 'Common/CustomDatePicker',
  component: CustomDatePicker,
  tags: ['autodocs'],
  argTypes: {
    onChange: { action: 'date selected' },
    minDate: { control: 'date' },
    maxDate: { control: 'date' },
  },
};

export default meta;

type Story = StoryObj<typeof CustomDatePicker>;

export const Default: Story = {
  render: args => {
    const [selected, setSelected] = useState<Date | string>('');
    const minDate = args.minDate ? new Date(args.minDate) : undefined;
    const maxDate = args.maxDate ? new Date(args.maxDate) : undefined;

    return (
      <CustomDatePicker
        {...args}
        selected={selected}
        minDate={minDate}
        maxDate={maxDate}
        onChange={date => {
          setSelected(date);
          args.onChange?.(date); // call Storybook action
        }}
      />
    );
  },

  args: {
    placeholderText: 'Pick a date',
    showMonthDropdown: true,
    showYearDropdown: true,
    scrollableYearDropdown: true,
    dropdownMode: 'scroll',
    minDate: undefined,
    maxDate: undefined,
  },
};

export const WithTimePicker: Story = {
  args: {
    dateFormat: 'MMMM d, yyyy h:mm aa',
    showTimeSelect: true,
    timeIntervals: 30,
    timeCaption: 'Time',
  },
};

const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 7);
export const WithMinMaxDate: Story = {
  args: {
    minDate: new Date(),
    maxDate: maxDate,
  },
};

export const DisabledDatePicker: Story = {
  args: {
    disabled: true,
  },
};

export const PreSelectedDate: Story = {
  args: {
    selected: new Date(),
  },
};
