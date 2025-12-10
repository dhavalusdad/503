import TagsCell from '.';

import type { TagsDataType } from './types';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TagsCell> = {
  title: 'Components/TagsCell',
  component: TagsCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A display component that shows a list of tags with colors. It truncates after a certain number of visible tags and shows "+X more".',
      },
    },
  },
  argTypes: {
    tags: {
      control: 'object',
      description: 'Array of tags with name and color',
    },
    tagsColor: {
      control: 'color',
      description: 'Default color used when a tag does not have its own color (hex without #)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TagsCell>;

const sampleTags: TagsDataType[] = [
  { id: '1', name: 'React', color: '61DAFB' },
  { id: '2', name: 'TypeScript', color: '3178C6' },
  { id: '3', name: 'JavaScript', color: 'F7DF1E' },
  { id: '4', name: 'Node.js', color: '68A063' },
  { id: '5', name: 'GraphQL', color: 'E10098' },
];

export const Default: Story = {
  args: {
    tags: sampleTags.slice(0, 3),
  },
};

export const WithMoreTags: Story = {
  args: {
    tags: sampleTags,
  },
};

export const WithoutColors: Story = {
  args: {
    tags: sampleTags.map(tag => ({ ...tag, color: '' })),
    tagsColor: '#79AC78',
  },
};
