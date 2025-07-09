// Modal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Modal from './Modal';

type ModalInterface = {
  title?: string;
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Modal title text',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    children: {
      control: false,
      description: 'Content inside the modal',
    },
    size:{
        control: {type:'radio'},
        options: ['sm', 'md', 'lg'],
        description: 'Size of the modal'
    }
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;
