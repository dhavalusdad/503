import ColumnCharts from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ColumnCharts> = {
  title: 'Charts/ColumnCharts', // Sidebar path in Storybook
  component: ColumnCharts,
  tags: ['autodocs'],
  args: {
    xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    yAxis: {
      col1: [5000, 7000, 6000, 8000, 9000, 10000],
      col2: [3000, 4000, 3500, 5000, 6000, 7000],
    },
    col1Name: 'Self Pay',
    col2Name: 'Insurance Pay',
    legend: { align: 'center', verticalAlign: 'bottom' },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: false } } },
  },
};

export default meta;

type Story = StoryObj<typeof ColumnCharts>;

export const Default: Story = {
  args: {
    legend: {
      align: 'right',
      verticalAlign: 'bottom',
    },
  },
};

export const OnlyCol1: Story = {
  args: {
    yAxis: {
      col1: [4000, 5000, 4500, 6000, 6500, 7000],
      col2: [],
    },
  },
};

export const OnlyCol2: Story = {
  args: {
    yAxis: {
      col1: [],
      col2: [2000, 3000, 2500, 4000, 4500, 5000],
    },
  },
};

export const CustomNames: Story = {
  args: {
    col1Name: 'Cash',
    col2Name: 'Credit',
    yAxis: {
      col1: [1000, 2000, 1500, 3000, 2500, 3500],
      col2: [500, 1000, 800, 1200, 900, 1500],
    },
  },
};

export const EmptyData: Story = {
  args: {
    yAxis: { col1: [], col2: [] },
    xAxis: [],
  },
};

export const LargeDataset: Story = {
  args: {
    xAxis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    yAxis: {
      col1: [1000, 2000, 1500, 3000, 2500, 3500, 4000, 4200, 4500, 4800, 5000, 5200],
      col2: [800, 1500, 1200, 2500, 2000, 3000, 3200, 3500, 3800, 4000, 4200, 4500],
    },
  },
};
