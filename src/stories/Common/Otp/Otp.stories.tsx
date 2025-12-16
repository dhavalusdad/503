import Otp from '@/stories/Common/Otp';

import type { Meta, StoryObj } from '@storybook/react';

// Create a wrapper component to handle state
const OtpWrapper = ({ length = 6, isValid = true }: { length?: number; isValid?: boolean }) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ marginBottom: '16px' }}>OTP Input Component</h3>
      <Otp setValue={data => console.log(data)} length={length} isValid={isValid} />
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        <p>Try typing numbers, pasting a code, or using arrow keys to navigate!</p>
      </div>
    </div>
  );
};

const meta: Meta<typeof OtpWrapper> = {
  title: 'Components/OTP Input',
  component: OtpWrapper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An OTP (One-Time Password) input component with paste support, keyboard navigation, and validation states.',
      },
    },
  },
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8, step: 1 },
      description: 'Number of OTP input fields',
    },
    isValid: {
      control: { type: 'boolean' },
      description: 'Whether the OTP input is in valid state (affects border color)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OtpWrapper>;

// Default story - 6 digit OTP
export const Default: Story = {
  args: {
    length: 12,
    isValid: true,
  },
};

// 4 digit OTP
export const FourDigit: Story = {
  args: {
    length: 4,
    isValid: true,
  },
};

// 8 digit OTP
export const EightDigit: Story = {
  args: {
    length: 8,
    isValid: true,
  },
};

// Invalid state
export const InvalidState: Story = {
  args: {
    length: 6,
    isValid: false,
  },
};

// Custom story with documentation
export const WithDocumentation: Story = {
  args: {
    length: 6,
    isValid: true,
  },
  render: args => (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3 style={{ marginBottom: '16px' }}>OTP Input Features</h3>
      <OtpWrapper {...args} />
      <div style={{ marginTop: '24px', maxWidth: '600px' }}>
        <h4 style={{ marginBottom: '12px', color: '#333' }}>Features:</h4>
        <ul style={{ lineHeight: '1.6', color: '#666' }}>
          <li>
            <strong>Paste Support:</strong> Paste a full OTP code and it will auto-fill all fields
          </li>
          <li>
            <strong>Keyboard Navigation:</strong> Use arrow keys to move between fields
          </li>
          <li>
            <strong>Auto-advance:</strong> Automatically moves to next field when typing
          </li>
          <li>
            <strong>Backspace Navigation:</strong> Smart backspace behavior that clears current
            field or moves to previous
          </li>
          <li>
            <strong>Input Validation:</strong> Only accepts numeric input
          </li>
          <li>
            <strong>Visual Feedback:</strong> Red border for invalid state
          </li>
          <li>
            <strong>Accessibility:</strong> Proper ARIA attributes and autocomplete support
          </li>
        </ul>
      </div>
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    length: 6,
    isValid: true,
  },
  render: args => (
    <div style={{ padding: '20px' }}>
      <h3>Interactive Playground</h3>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Try different configurations using the controls panel below!
      </p>
      <OtpWrapper {...args} />
    </div>
  ),
};
