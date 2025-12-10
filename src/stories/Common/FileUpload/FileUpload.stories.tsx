import FileUpload from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A versatile file upload component with drag-and-drop functionality, preview, and file management capabilities.',
      },
    },
  },
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
      defaultValue: true,
    },
    accept: {
      control: 'text',
      description: 'File types to accept (e.g., "image/*", ".pdf,.doc")',
      defaultValue: 'image/*',
    },
    NumberOfFileAllowed: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of files allowed',
      defaultValue: 2,
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
      defaultValue: '',
    },
    handelSubmit: {
      action: 'files submitted',
      description: 'Callback function when files are submitted',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    NumberOfFileAllowed: 2,
    handelSubmit: files => {
      console.log('Files submitted:', files);
    },
    noLimit: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default configuration with multiple image uploads allowed (max 2 files).',
      },
    },
  },
};

// Single file upload
export const SingleFile: Story = {
  args: {
    multiple: false,
    accept: 'image/*',
    NumberOfFileAllowed: 1,
    handelSubmit: files => {
      console.log('Single file submitted:', files);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Single file upload mode - only one file can be selected at a time.',
      },
    },
  },
};

// PDF documents only
export const PDFOnly: Story = {
  args: {
    multiple: true,
    accept: '.pdf',
    NumberOfFileAllowed: 3,
    noLimit: false,
    handelSubmit: files => {
      console.log('PDF files submitted:', files);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Restricted to PDF files only with a maximum of 3 files.',
      },
    },
  },
};

// Multiple file types
export const MultipleTypes: Story = {
  args: {
    multiple: true,
    accept: 'image/*,.pdf,.doc,.docx',
    noLimit: false,
    NumberOfFileAllowed: 5,
    handelSubmit: files => {
      console.log('Multiple type files submitted:', files);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Accepts images, PDFs, and Word documents with up to 5 files allowed.',
      },
    },
  },
};

// Large file limit
export const LargeFileLimit: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    NumberOfFileAllowed: 10,
    noLimit: false,
    handelSubmit: files => {
      console.log('Large batch submitted:', files);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Allows up to 10 image files for bulk uploads.',
      },
    },
  },
};

// Custom styling
export const CustomStyled: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    NumberOfFileAllowed: 3,
    noLimit: false,
    className: 'max-w-md mx-auto border-2 border-blue-200 rounded-xl p-4',
    handelSubmit: files => {
      console.log('Custom styled files submitted:', files);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom styling applied with additional CSS classes.',
      },
    },
  },
};

// Interactive demo
export const InteractiveDemo: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    NumberOfFileAllowed: 2,
    noLimit: false,
    handelSubmit: files => {
      if (Array.isArray(files)) {
        alert(`${files.length} files submitted: ${files.map(f => f.name).join(', ')}`);
      } else {
        alert('No files submitted');
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with alert feedback when files are submitted.',
      },
    },
  },
};

// Error state demonstration
export const ErrorState: Story = {
  args: {
    multiple: true,
    accept: 'image/*',
    NumberOfFileAllowed: 1, // Set to 1 to easily trigger error
    noLimit: false,
    handelSubmit: files => {
      console.log('Files submitted:', files);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error state when file limit is exceeded (try uploading 2+ files).',
      },
    },
  },
};

// All file types
export const AllFileTypes: Story = {
  args: {
    multiple: true,
    accept: '*/*',
    NumberOfFileAllowed: 5,
    noLimit: false,
    handelSubmit: files => {
      console.log('All file types submitted:', files);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Accepts all file types (*/*) with up to 5 files.',
      },
    },
  },
};
