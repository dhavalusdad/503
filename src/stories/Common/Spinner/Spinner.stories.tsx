import '../../../index.css';

import Spinner, { type SpinnerProps } from '@/stories/Common/Spinner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Spinner> = {
  title: 'Common/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: {
    size: 'w-8 h-8',
    color: 'text-red-500',
    speed: 'animate-spin',
  },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 'w-8 h-8',
    color: 'text-red-500',
    speed: 'animate-spin',
  },
};

export const Small: Story = {
  args: {
    size: 'w-4 h-4',
    color: 'text-red-500',
    speed: 'animate-spin',
  },
};

export const Medium: Story = {
  args: {
    size: 'w-8 h-8',
    color: 'text-red-500',
    speed: 'animate-spin',
  },
};

export const Large: Story = {
  args: {
    size: 'w-12 h-12',
    color: 'text-red-500',
    speed: 'animate-spin',
  },
};

export const ExtraLarge: Story = {
  args: {
    size: 'w-16 h-16',
    color: 'text-red-500',
    speed: 'animate-spin',
  },
};

export const BlueColor: Story = {
  args: {
    size: 'w-8 h-8',
    color: 'text-blue-500',
    speed: 'animate-spin',
  },
};

export const GreenColor: Story = {
  args: {
    size: 'w-8 h-8',
    color: 'text-green-500',
    speed: 'animate-spin',
  },
};

export const PurpleColor: Story = {
  args: {
    size: 'w-8 h-8',
    color: 'text-purple-500',
    speed: 'animate-spin',
  },
};

export const SlowSpeed: Story = {
  args: {
    size: 'w-8 h-8',
    color: 'text-red-500',
    speed: 'animate-spin-slow',
  },
};

export const FastSpeed: Story = {
  args: {
    size: 'w-8 h-8',
    color: 'text-red-500',
    speed: 'animate-ping',
  },
};

export const CustomClassNames: Story = {
  args: {
    size: 'w-10 h-10',
    color: 'text-orange-500',
    speed: 'animate-spin',
    className: 'drop-shadow-lg',
  },
};

export const InButton: Story = {
  render: (args: SpinnerProps) => (
    <button className='bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2'>
      <Spinner {...args} />
      Loading...
    </button>
  ),
  args: {
    size: 'w-4 h-4',
    color: 'text-white',
    speed: 'animate-spin',
  },
};

export const CenteredCard: Story = {
  render: (args: SpinnerProps) => (
    <div className='w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center'>
      <Spinner {...args} />
    </div>
  ),
  args: {
    size: 'w-8 h-8',
    color: 'text-gray-600',
    speed: 'animate-spin',
  },
};
