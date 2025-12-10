import { useState } from 'react';

import Modal from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable modal component with customizable size, title, and close behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Modal title text',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
    },
    children: {
      control: false,
      description: 'Content inside the modal',
    },
    size: {
      control: { type: 'radio' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the modal',
    },
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is visible',
    },
    onClose: {
      action: 'closed',
      description: 'Callback function when modal is closed',
    },
    closeButton: {
      control: 'boolean',
      description: 'Show or hide the close button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Default story with interactive controls
export const Default: Story = {
  args: {
    title: 'Modal Title',
    size: 'md',
    isOpen: true,
    closeButton: true,
    children: (
      <div>
        <p>This is the modal content.</p>
        <p>You can add any React components or elements here.</p>
      </div>
    ),
  },
};

// Extra small modal story
export const ExtraSmall: Story = {
  args: {
    title: 'Extra Small Modal',
    size: 'xs',
    isOpen: true,
    closeButton: true,
    children: <p>Content in an extra small modal.</p>,
  },
};

// Small modal story
export const Small: Story = {
  args: {
    title: 'Small Modal',
    size: 'sm',
    isOpen: true,
    closeButton: true,
    children: <p>Content in a small modal.</p>,
  },
};

// Large modal story
export const Large: Story = {
  args: {
    title: 'Large Modal',
    size: 'lg',
    isOpen: true,
    closeButton: true,
    children: (
      <div>
        <p>Content in a large modal.</p>
        <p>This modal has more space for content.</p>
      </div>
    ),
  },
};

// Modal without close button
export const NoCloseButton: Story = {
  args: {
    title: 'Modal Without Close Button',
    size: 'md',
    isOpen: true,
    closeButton: false,
    children: <p>This modal has no close button. Click outside to close.</p>,
  },
};

// Modal with subtitle
export const WithSubtitle: Story = {
  args: {
    title: 'Modal with Subtitle',
    subTitle: 'This is a subtitle for the modal',
    size: 'md',
    isOpen: true,
    closeButton: true,
    children: (
      <div>
        <p>This modal includes a subtitle below the main title.</p>
        <p>Useful for providing additional context.</p>
      </div>
    ),
  },
};

// Modal with footer
export const WithFooter: Story = {
  args: {
    title: 'Modal with Footer',
    size: 'md',
    isOpen: true,
    closeButton: true,
    footer: (
      <div className='flex justify-end gap-2'>
        <button className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50'>
          Cancel
        </button>
        <button className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'>
          Confirm
        </button>
      </div>
    ),
    children: (
      <div>
        <p>This modal has a footer with action buttons.</p>
        <p>Useful for forms or actions that need confirmation.</p>
      </div>
    ),
  },
};

// Modal with custom header
export const CustomHeader: Story = {
  args: {
    isOpen: true,
    closeButton: true,
    size: 'md',
    header: (
      <div className='flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white'>
        <div>
          <h2 className='text-xl font-semibold'>Custom Header</h2>
          <p className='text-green-100'>With custom styling</p>
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
        <p>This modal uses a custom header component.</p>
        <p>You can create any custom header design you want.</p>
      </div>
    ),
  },
};

// Interactive modal with toggle
export const Interactive: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <button
          className='bg-blue-500 text-white px-4 py-2 rounded'
          onClick={() => setIsOpen(true)}
        >
          Open Modal
        </button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          children={
            <div>
              <p>This is an interactive modal.</p>
              <p>Click the button below or outside to close.</p>
              <button
                className='mt-4 bg-gray-200 px-4 py-2 rounded'
                onClick={() => setIsOpen(false)}
              >
                Close Modal
              </button>
            </div>
          }
        />
      </div>
    );
  },
  args: {
    title: 'Interactive Modal',
    size: 'md',
    closeButton: true,
  },
};

// Form modal example
export const FormModal: Story = {
  args: {
    title: 'Contact Form',
    size: 'md',
    isOpen: true,
    closeButton: true,
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
