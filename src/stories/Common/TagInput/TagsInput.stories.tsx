import { useState } from 'react';

// import { action } from '@storybook/addon-actions';
import TagInput, { type TagInputProps } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TagInput> = {
  title: 'Components/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A reusable tag input component that allows users to add and remove tags by typing and pressing Enter.',
      },
    },
  },
  argTypes: {
    tags: {
      control: 'object',
      description: 'Array of current tags',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    name: {
      control: 'text',
      description: 'Name attribute for the input',
    },
    onAdd: {
      action: 'tag-added',
      description: 'Callback when a tag is added',
    },
    onRemove: {
      action: 'tag-removed',
      description: 'Callback when a tag is removed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TagInput>;

// Interactive wrapper for stories
const TagInputWrapper = ({ initialTags = [], ...props }: TagInputProps) => {
  const [tags, setTags] = useState<string[]>(initialTags);

  const handleAdd = (tag: string) => {
    setTags(prev => [...prev, tag]);
  };

  const handleRemove = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <div className='w-96'>
      <TagInput {...props} tags={tags} onAdd={handleAdd} onRemove={handleRemove} />
    </div>
  );
};

export const Default: Story = {
  render: (args: TagInputProps) => <TagInputWrapper {...args} />,
  args: {
    initialTags: [],
    placeholder: 'Add a tag...',
    name: 'tags',
  },
};

export const WithInitialTags: Story = {
  render: (args: TagInputProps) => <TagInputWrapper {...args} />,
  args: {
    initialTags: ['React', 'TypeScript', 'JavaScript'],
    placeholder: 'Add more tags...',
    name: 'skills',
  },
};
