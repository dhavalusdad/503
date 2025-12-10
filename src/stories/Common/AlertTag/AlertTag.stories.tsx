import { AlertTag } from '.';

// Storybook configuration
export default {
  title: 'Components/AlertTag',
  component: AlertTag,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile tag component for displaying alerts, statuses, categories, and more with multiple variants, colors, and sizes.',
      },
    },
  },
  argTypes: {
    tag: {
      control: 'text',
      description: 'The text content of the tag',
    },
    variant: {
      control: { type: 'select' },
      options: ['filled', 'outline', 'none'],
      description: 'Visual variant of the tag',
    },
    color: {
      control: { type: 'select' },
      options: ['red', 'yellow', 'green', 'blue', 'orange', 'purple', 'gray', 'indigo', 'pink'],
      description: 'Color theme of the tag',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the tag',
    },
    icon: {
      control: false,
      description: 'Optional icon to display before the tag text',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  tags: ['autodocs'],
};

// Default story
export const Default = {
  args: {
    tag: 'Default Tag',
  },
};

// Variant stories
export const Filled = {
  args: {
    tag: 'Filled',
    variant: 'filled',
    color: 'blue',
  },
};

export const Outline = {
  args: {
    tag: 'Outline',
    variant: 'outline',
    color: 'green',
  },
};

export const None = {
  args: {
    tag: 'None',
    variant: 'none',
    color: 'purple',
  },
};

// Color variations
export const Colors = {
  render: () => (
    <div className='flex flex-wrap gap-3'>
      {['red', 'yellow', 'green', 'blue', 'orange', 'purple', 'gray', 'indigo', 'pink'].map(
        color => (
          <AlertTag
            key={color}
            tag={color.charAt(0).toUpperCase() + color.slice(1)}
            variant='filled'
          />
        )
      )}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available color options with filled variant.',
      },
    },
  },
};

// Size variations
export const Sizes = {
  render: () => (
    <div className='flex items-center gap-4'>
      <AlertTag tag='Small' size='sm' color='blue' variant='filled' />
      <AlertTag tag='Medium' size='md' color='blue' variant='filled' />
      <AlertTag tag='Large' size='lg' color='blue' variant='filled' />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different size options available.',
      },
    },
  },
};

// With icons
export const WithIcons = {
  render: () => <div className='flex flex-wrap gap-3'></div>,
  parameters: {
    docs: {
      description: {
        story: 'Tags with icons for enhanced visual communication.',
      },
    },
  },
};

// Variant comparison
export const VariantComparison = {
  render: () => (
    <div className='space-y-4'>
      <div className='flex gap-3'>
        <AlertTag tag='Filled Red' variant='filled' color='red' />
        <AlertTag tag='Outline Red' variant='outline' color='red' />
        <AlertTag tag='None Red' variant='none' color='red' />
      </div>
      <div className='flex gap-3'>
        <AlertTag tag='Filled Blue' variant='filled' color='blue' />
        <AlertTag tag='Outline Blue' variant='outline' color='blue' />
        <AlertTag tag='None Blue' variant='none' color='blue' />
      </div>
      <div className='flex gap-3'>
        <AlertTag tag='Filled Green' variant='filled' color='green' />
        <AlertTag tag='Outline Green' variant='outline' color='green' />
        <AlertTag tag='None Green' variant='none' color='green' />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all three variants with different colors.',
      },
    },
  },
};

// Status indicators use case
export const StatusIndicators = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <AlertTag tag='Active' variant='filled' color='green' size='sm' />
      <AlertTag tag='Pending' variant='filled' color='yellow' size='sm' />
      <AlertTag tag='Inactive' variant='filled' color='gray' size='sm' />
      <AlertTag tag='Error' variant='filled' color='red' size='sm' />
      <AlertTag tag='Draft' variant='outline' color='blue' size='sm' />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common use case for status indicators.',
      },
    },
  },
};

// Priority levels use case
export const PriorityLevels = {
  render: () => (
    <div className='flex flex-wrap gap-3'>
      <AlertTag tag='High Priority' variant='filled' color='red' />
      <AlertTag tag='Medium Priority' variant='filled' color='yellow' />
      <AlertTag tag='Low Priority' variant='none' color='gray' />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Priority level indicators with appropriate colors and icons.',
      },
    },
  },
};

// Categories use case
export const Categories = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <AlertTag tag='Frontend' variant='outline' color='blue' />
      <AlertTag tag='Backend' variant='outline' color='green' />
      <AlertTag tag='Design' variant='outline' color='purple' />
      <AlertTag tag='DevOps' variant='outline' color='orange' />
      <AlertTag tag='Mobile' variant='outline' color='indigo' />
      <AlertTag tag='Testing' variant='outline' color='pink' />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Category tags for organizing content.',
      },
    },
  },
};

// Skills and badges use case
export const SkillsBadges = {
  render: () => (
    <div className='flex flex-wrap gap-2'>
      <AlertTag tag='React' variant='none' color='blue' />
      <AlertTag tag='TypeScript' variant='none' color='indigo' />
      <AlertTag tag='Tailwind CSS' variant='none' color='pink' />
      <AlertTag tag='Expert' variant='filled' color='green' size='sm' />
      <AlertTag tag='Certified' variant='filled' color='yellow' size='sm' />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skills and achievement badges.',
      },
    },
  },
};

// Interactive playground
export const Playground = {
  args: {
    tag: 'Playground Tag',
    variant: 'filled',
    color: 'blue',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different combinations of props.',
      },
    },
  },
};
