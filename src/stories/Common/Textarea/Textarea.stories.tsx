import { type Meta, type StoryObj } from '@storybook/react';

import TextArea from '@/stories/Common/Textarea';

const meta: Meta<typeof TextArea> = {
  title: 'Common/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  args: {
    label: 'Bio',
    placeholder: 'Enter your bio (max 500 characters)',
    rows: 4,
    error: '',
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {},
};

export const WithError: Story = {
  args: {
    error: 'Bio is required',
  },
};

export const CustomRows: Story = {
  args: {
    rows: 6,
  },
};
