import { useState } from 'react';

import { DeleteModal } from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DeleteModal> = {
  title: 'Common/DeleteModal',
  component: DeleteModal,
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'modal closed' },
    onSubmit: { action: 'confirmed' },
  },
};

export default meta;

type Story = StoryObj<typeof DeleteModal>;

export const Default: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <DeleteModal
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
    title: 'Confirm Delete',
    message: 'Test Module',
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
