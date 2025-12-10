// src/components/common/Table/Table.stories.tsx

import { Table } from './index';

import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';

// Dummy data interface
interface Person {
  id: number;
  name: string;
  age: number;
  email: string;
}

// Sample data
const sampleData: Person[] = [
  { id: 1, name: 'Alice', age: 28, email: 'alice@example.com' },
  { id: 2, name: 'Bob', age: 35, email: 'bob@example.com' },
  { id: 3, name: 'Charlie', age: 22, email: 'charlie@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
  { id: 4, name: 'David', age: 41, email: 'david@example.com' },
];

// Column definitions
const columns: ColumnDef<Person>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'age',
    header: 'Age',
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: info => info.getValue(),
  },
];

const meta: Meta<typeof Table<Person>> = {
  title: 'Common/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Table<Person>>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns,
  },
};

export const WithoutPagination: Story = {
  args: {
    data: sampleData,
    columns,
    pagination: false,
  },
};

export const withNoData: Story = {
  args: {
    data: [],
    columns,
  },
};
