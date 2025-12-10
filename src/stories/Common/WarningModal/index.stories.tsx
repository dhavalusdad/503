import { WarningModal } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof WarningModal> = {
  title: 'Components/WarningModal',
  component: WarningModal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      description: 'Controls whether the modal is visible',
      control: 'boolean',
    },
    message: {
      description: 'The main message text displayed in the modal',
      control: 'text',
    },
    title: {
      description: 'Optional modal title, defaults to "Warning"',
      control: 'text',
    },
    size: {
      description: 'Size of the modal',
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'], // adjust as per ModalSizeType
    },
    onClose: { action: 'closed' },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    message: 'This is a warning message!',
    title: 'Warning',
    size: 'md',
  },
};

export const SmallModal: Story = {
  args: {
    isOpen: true,
    message: 'This is a small warning modal',
    title: 'Warning',
    size: 'sm',
  },
};

export const LargeModal: Story = {
  args: {
    isOpen: true,
    message: 'This is a large warning modal with more content to test layout',
    title: 'Warning',
    size: 'lg',
  },
};

export const CustomTitle: Story = {
  args: {
    isOpen: true,
    message: 'You can customize the title',
    title: 'Custom Warning',
    size: 'md',
  },
};
