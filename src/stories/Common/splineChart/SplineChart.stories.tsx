import SplineChartCard from '@/stories/Common/splineChart';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Charts/SplineChartCard',
  component: SplineChartCard,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'Title displayed above the chart' },
    height: { control: 'number', description: 'Height of the chart container' },
    seriesData: {
      control: 'object',
    },
    filterOptions: {
      control: 'object',
      description: 'Dropdown options for filtering the chart data',
    },
    defaultFilter: { control: 'text', description: 'The default selected filter value' },
    newClientsColor: { control: 'color', description: 'Color for the New Clients line' },
    repeatClientsColor: { control: 'color', description: 'Color for the Repeat Clients line' },
  },
} satisfies Meta<typeof SplineChartCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const exampleSeriesData = [
  {
    filterKey: 'thisMonth',
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    newClients: [5, 10, 8, 12],
    repeatClients: [2, 4, 3, 5],
  },
  {
    filterKey: 'lastMonth',
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    newClients: [3, 7, 6, 8],
    repeatClients: [1, 2, 4, 3],
  },
];

const exampleFilterOptions = [
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
];

export const Default: Story = {
  args: {
    title: 'Client Growth Overview',
    height: 400,
    seriesData: exampleSeriesData,
    filterOptions: exampleFilterOptions,
    defaultFilter: 'thisMonth',
    newClientsColor: '#3B82F6',
    repeatClientsColor: '#F59E0B',
  },
};
