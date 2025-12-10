import type { Meta, StoryObj } from '@storybook/react';

import '@/index.css';
import { IntakeFormModal } from '@/features/IntakeForm/components/IntakeFormModal';

const meta: Meta<typeof IntakeFormModal> = {
  title: 'Forms/Adult Initial Evaluation',
  component: IntakeFormModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete demonstration of the Intake Form with statistics, instructions, and debug information',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IntakeFormModal>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Full demo page showing the intake form with all features and debugging capabilities',
      },
    },
  },
};
