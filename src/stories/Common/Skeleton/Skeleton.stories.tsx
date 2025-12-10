import Skeleton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Common/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: { type: 'number' },
      description: 'Number of skeleton items to render',
      defaultValue: 3,
    },
    className: {
      control: 'text',
      description: 'Custom classes for individual skeleton blocks',
    },
    parentClassName: {
      control: 'text',
      description: 'Custom classes for the parent wrapper',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    count: 3,
  },
};

export const CustomHeight: Story = {
  args: {
    count: 4,
    className: 'h-32 bg-gray-300',
  },
};

export const HorizontalLayout: Story = {
  args: {
    count: 5,
    parentClassName: 'flex flex-row gap-4',
    className: 'w-24 h-24 bg-gray-300',
  },
};

export const Colored: Story = {
  args: {
    count: 3,
    className: 'bg-gradient-to-r from-gray-300 to-gray-100',
  },
};
