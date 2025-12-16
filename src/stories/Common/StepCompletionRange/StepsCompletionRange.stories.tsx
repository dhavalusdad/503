import { StepCompletionRange } from '@/stories/Common/StepCompletionRange';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof StepCompletionRange> = {
  title: 'Components/StepCompletionRange',
  component: StepCompletionRange,
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1 },
      description: 'Current active step (1-based)',
    },
    totalSteps: {
      control: { type: 'number', min: 2 },
      description: 'Total number of steps in the range',
    },
    parentClassName: {
      control: 'text',
      description: 'Additional parent wrapper class for layout spacing',
    },
    className: {
      control: 'text',
      description: 'Height and spacing of the connector line',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StepCompletionRange>;

// Default Story
export const Default: Story = {
  args: {
    currentStep: 2,
    totalSteps: 5,
  },
};

// Active First Step
export const StepOneActive: Story = {
  args: {
    currentStep: 1,
    totalSteps: 5,
  },
};

// Middle Progress
export const Halfway: Story = {
  args: {
    currentStep: 3,
    totalSteps: 6,
  },
};

// Completed All Steps
export const Completed: Story = {
  args: {
    currentStep: 6,
    totalSteps: 6,
  },
};

// Custom Styling Example
export const CustomStyle: Story = {
  args: {
    currentStep: 3,
    totalSteps: 5,
    parentClassName: 'mt-10 bg-gray-50 p-4 rounded-xl',
    className: 'h-[8px]',
  },
};
