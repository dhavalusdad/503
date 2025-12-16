import { useState } from 'react';

import Drawer from '@/stories/Common/Drawer';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A reusable drawer component that slides in from the left or right side of the screen.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Drawer title text',
    },
    subTitle: {
      control: 'text',
      description: 'Drawer subtitle text',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
    },
    parentClassName: {
      control: 'text',
      description: 'Additional CSS classes for the backdrop',
    },
    contentClassName: {
      control: 'text',
      description: 'Additional CSS classes for the content area',
    },
    children: {
      control: false,
      description: 'Content inside the drawer',
    },
    position: {
      control: { type: 'radio' },
      options: ['left', 'right'],
      description: 'Position of the drawer (left or right)',
    },
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the drawer is visible',
    },
    onClose: {
      action: 'closed',
      description: 'Callback function when drawer is closed',
    },
    closeButton: {
      control: 'boolean',
      description: 'Show or hide the close button',
    },
    width: {
      control: 'text',
      description: 'Width of the drawer (Tailwind CSS classes)',
    },
    footer: {
      control: false,
      description: 'Footer content for the drawer',
    },
    footerClassName: {
      control: 'text',
      description: 'Additional CSS classes for the footer',
    },
    titleClassName: {
      control: 'text',
      description: 'Additional CSS classes for the title area',
    },
    header: {
      control: false,
      description: 'Custom header component',
    },
    id: {
      control: 'text',
      description: 'Unique identifier for the drawer',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

// Default story with interactive controls
export const Default: Story = {
  args: {
    title: 'Drawer Title',
    position: 'right',
    isOpen: true,
    closeButton: true,
    width: 'w-96',
    children: (
      <div>
        <p>This is the drawer content.</p>
        <p>You can add any React components or elements here.</p>
      </div>
    ),
  },
};

// Left positioned drawer
export const LeftPosition: Story = {
  args: {
    title: 'Left Drawer',
    position: 'left',
    isOpen: true,
    closeButton: true,
    width: 'w-80',
    children: (
      <div>
        <p>This drawer slides in from the left side.</p>
        <p>Useful for navigation menus or settings panels.</p>
      </div>
    ),
  },
};

// Wide drawer
export const WideDrawer: Story = {
  args: {
    title: 'Wide Drawer',
    position: 'right',
    isOpen: true,
    closeButton: true,
    width: 'w-[600px]',
    children: (
      <div>
        <p>This is a wider drawer with more space.</p>
        <p>Perfect for forms or detailed content.</p>
      </div>
    ),
  },
};

// Drawer without close button
export const NoCloseButton: Story = {
  args: {
    title: 'Drawer Without Close Button',
    position: 'right',
    isOpen: true,
    closeButton: false,
    width: 'w-96',
    children: <p>This drawer has no close button. Click outside to close.</p>,
  },
};

// Drawer with subtitle
export const WithSubtitle: Story = {
  args: {
    title: 'Drawer with Subtitle',
    subTitle: 'This is a subtitle for the drawer',
    position: 'right',
    isOpen: true,
    closeButton: true,
    width: 'w-96',
    children: (
      <div>
        <p>This drawer includes a subtitle below the main title.</p>
        <p>Useful for providing additional context.</p>
      </div>
    ),
  },
};

// Drawer with footer
export const WithFooter: Story = {
  args: {
    title: 'Drawer with Footer',
    position: 'right',
    isOpen: true,
    closeButton: true,
    width: 'w-96',
    footer: (
      <div className='flex justify-end gap-2'>
        <button className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50'>
          Cancel
        </button>
        <button className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>Save</button>
      </div>
    ),
    children: (
      <div>
        <p>This drawer has a footer with action buttons.</p>
        <p>Useful for forms or actions that need confirmation.</p>
      </div>
    ),
  },
};

// Interactive drawer with toggle
export const Interactive: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded'
          onClick={() => setIsOpen(true)}
        >
          Open Drawer
        </button>
        <Drawer
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          children={
            <div>
              <p>This is an interactive drawer.</p>
              <p>Click the button below or outside to close.</p>
              <button
                className='mt-4 bg-gray-200 px-4 py-2 rounded'
                onClick={() => setIsOpen(false)}
              >
                Close Drawer
              </button>
            </div>
          }
        />
      </div>
    );
  },
  args: {
    title: 'Interactive Drawer',
    position: 'right',
    closeButton: true,
    width: 'w-96',
  },
};

// Drawer with custom header
export const CustomHeader: Story = {
  args: {
    isOpen: true,
    closeButton: true,
    width: 'w-96',
    header: (
      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
        <div>
          <h2 className='text-xl font-semibold'>Custom Header</h2>
          <p className='text-blue-100'>With custom styling</p>
        </div>
        <button className='p-2 hover:bg-white/20 rounded-full'>
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    ),
    children: (
      <div>
        <p>This drawer uses a custom header component.</p>
        <p>You can create any custom header design you want.</p>
      </div>
    ),
  },
};

// Form drawer example
export const FormDrawer: Story = {
  args: {
    title: 'Contact Form',
    position: 'right',
    isOpen: true,
    closeButton: true,
    width: 'w-[500px]',
    footer: (
      <div className='flex justify-end gap-2'>
        <button className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50'>
          Cancel
        </button>
        <button className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
          Submit
        </button>
      </div>
    ),
    children: (
      <form className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>Name</label>
          <input
            type='text'
            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter your name'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>Email</label>
          <input
            type='email'
            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter your email'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>Message</label>
          <textarea
            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            rows={3}
            placeholder='Enter your message'
          />
        </div>
      </form>
    ),
  },
};
