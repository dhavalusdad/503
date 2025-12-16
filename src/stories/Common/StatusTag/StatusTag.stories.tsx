import '../../../index.css';
import StatusTag from '@/stories/Common/StatusTag';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof StatusTag> = {
  title: 'Common/StatusTag',
  component: StatusTag,
  tags: ['autodocs'],
  args: {
    title: 'Status',
    status: 'active',
  },
};

export default meta;
type Story = StoryObj<typeof StatusTag>;

export const Active: Story = {
  args: {
    status: 'active',
    title: 'Active',
  },
};

export const Inactive: Story = {
  args: {
    status: 'inactive',
    title: 'Inactive',
  },
};
