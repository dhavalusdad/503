import '../../../index.css';

import { AmdSimpleIcdCptSelector } from './SimpleAmdIcdCptSelector';

import type { Meta, StoryObj } from '@storybook/react-vite';

type Story = StoryObj<typeof AmdSimpleIcdCptSelector>;

const meta: Meta<typeof AmdSimpleIcdCptSelector> = {
  title: 'Forms/AmdSimpleIcdCptSelector',
  component: AmdSimpleIcdCptSelector,
  tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
  render: args => <AmdSimpleIcdCptSelector {...args} />,
};
