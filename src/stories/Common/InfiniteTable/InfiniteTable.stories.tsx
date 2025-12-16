// InfiniteTable.stories.tsx
import { useRef, useState } from 'react';

import { type ColumnDef, type SortingState } from '@tanstack/react-table';

import InfiniteTable, { type InfiniteTableProps } from '@/stories/Common/InfiniteTable';

import type { Meta, StoryObj } from '@storybook/react-vite';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const initialData: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 2 === 0 ? 'Admin' : 'User',
}));

const columns: ColumnDef<User>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
];

const meta: Meta<typeof InfiniteTable> = {
  title: 'Tables/InfiniteTable',
  component: InfiniteTable,
  tags: ['autodocs'],
  argTypes: {
    onRowClick: { action: 'row clicked' },
    onLoadMore: { action: 'load more triggered' },
    loadingText: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof InfiniteTable>;

const InfiniteTableWrapper = (props: Partial<InfiniteTableProps<User>>) => {
  const [data, setData] = useState<User[]>(initialData);
  const [sorting, setSorting] = useState<SortingState>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = () => {
    const nextData: User[] = Array.from({ length: 10 }, (_, i) => ({
      id: data.length + i + 1,
      name: `User ${data.length + i + 1}`,
      email: `user${data.length + i + 1}@example.com`,
      role: (data.length + i) % 2 === 0 ? 'Admin' : 'User',
    }));
    setData([...data, ...nextData]);
  };

  return (
    <InfiniteTable<User>
      {...props}
      data={data}
      columns={columns}
      sorting={sorting}
      setSorting={setSorting}
      loaderRef={loaderRef}
      onLoadMore={handleLoadMore}
      hasNextPage={props.hasNextPage || true}
    />
  );
};

export const Default: Story = {
  render: () => <InfiniteTableWrapper />,
};

export const NoMorePages: Story = {
  render: () => <InfiniteTableWrapper hasNextPage={false} />,
};
