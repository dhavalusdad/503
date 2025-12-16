import { Pagination } from '@/stories/Common/Pagination';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Pagination> = {
  title: 'Common/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    table: {},
    totalCount: 0,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};

export const with50Rows: Story = {
  args: {
    totalCount: 50,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};
