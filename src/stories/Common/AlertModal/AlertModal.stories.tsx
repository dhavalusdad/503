import { useState } from 'react';

import { AlertModal } from '@/stories/Common/AlertModal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof AlertModal> = {
  title: 'Common/AlertModal',
  component: AlertModal,
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'modal closed' },
    onSubmit: { action: 'confirmed' },
  },
};

export default meta;

type Story = StoryObj<typeof AlertModal>;

export const Default: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <AlertModal
        {...args}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          args.onClose?.(); // log action in Storybook
        }}
        onSubmit={() => {
          args.onSubmit?.(); // log action in Storybook
          setIsOpen(false);
        }}
      />
    );
  },

  args: {
    title: 'Confirm Discard',
    alertMessage: 'Are you sure? ',
    confirmButtonText: 'Delete',
    cancelButton: true,
    size: 'md',
    isSubmitLoading: false,
  },
};

export const WithoutCancelButton: Story = {
  ...Default,
  args: {
    ...Default.args,
    cancelButton: false,
  },
};

export const LoadingState: Story = {
  ...Default,
  args: {
    ...Default.args,
    isSubmitLoading: true,
  },
};
