import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import Breadcrumb from '.';

import type { Meta, StoryObj } from '@storybook/react-vite';

const store = configureStore({
  reducer: {
    user: (state = { role: 'client' }) => state,
  },
});

const meta: Meta<typeof Breadcrumb> = {
  title: 'Common/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <Provider store={store}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </Provider>
    ),
  ],
  args: {
    breadcrumbs: [],
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

export const Multiple: Story = {
  args: {
    breadcrumbs: [
      { label: 'Home', isActive: false },
      { label: 'Settings', isActive: true },
    ],
  },
};

export const MultipleActive: Story = {
  args: {
    breadcrumbs: [
      { label: 'Home', isActive: true },
      { label: 'Settings', isActive: true },
    ],
  },
};

export const MultipleWithNavigation: Story = {
  args: {
    breadcrumbs: [
      { label: 'Home', isActive: true, path: '/dashboard/home' },
      { label: 'Settings', isActive: true, path: '/dashboard/home/settings' },
    ],
  },
};
