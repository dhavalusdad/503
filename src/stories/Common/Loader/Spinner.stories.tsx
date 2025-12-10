import SectionLoader from './Spinner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SectionLoader> = {
  title: 'Common/Loader',
  component: SectionLoader,
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
    size: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof SectionLoader>;

export const Default: Story = {
  args: {},
};

export const CustomSize: Story = {
  args: {
    size: 'h-6 w-6',
  },
};
