import Tooltip from '@/stories/Common/Tooltip/Tooltip';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    children: {
      description: 'The element that triggers the tooltip on hover',
      control: { type: undefined }, // We usually don’t control children via Storybook UI
    },
    className: {
      description: 'Custom class for the tooltip container',
      control: 'text',
    },
    label: {
      description: 'Text content displayed inside the tooltip',
      control: 'text',
    },
    disable: {
      description: 'If true, disables the tooltip and shows children normally',
      control: 'boolean',
    },
    placement: {
      description: 'Tooltip placement relative to the children',
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ],
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default tooltip
export const Default: Story = {
  args: {
    label: 'Hello Tooltip!',
    className: 'bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg z-[1000]',
    children: <button className='px-4 py-2 bg-blue-500 text-white rounded'>Hover me</button>,
    disable: false,
    placement: 'right',
  },
};

export const Disabled: Story = {
  args: {
    label: 'This will not show',
    className: 'bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg z-[1000]',
    children: <button className='px-4 py-2 bg-gray-500 text-white rounded'>Hover me</button>,
    disable: true,
    placement: 'right',
  },
};

export const TopPlacement: Story = {
  args: {
    label: 'Tooltip on top',
    className: 'bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg z-[1000]',
    children: <button className='px-4 py-2 bg-green-500 text-white rounded'>Hover me</button>,
    placement: 'top',
  },
};
