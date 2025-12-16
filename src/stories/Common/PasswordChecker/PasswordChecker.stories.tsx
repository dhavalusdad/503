import PasswordChecker from '@/stories/Common/PasswordChecker';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof PasswordChecker> = {
  title: 'Components/PasswordChecker',
  component: PasswordChecker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A password validation component that checks for various password requirements including length, character types, and special characters.',
      },
    },
  },
  argTypes: {
    password: {
      control: 'text',
      description: 'The password string to validate',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with empty password
export const Default: Story = {
  args: {
    password: '',
  },
};

// Story with weak password
export const WeakPassword: Story = {
  args: {
    password: 'pass',
  },
  parameters: {
    docs: {
      description: {
        story: 'A weak password that fails most validation requirements.',
      },
    },
  },
};

// Story with medium strength password
export const MediumPassword: Story = {
  args: {
    password: 'Password123',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A medium strength password that meets most requirements but lacks special characters.',
      },
    },
  },
};

// Story with strong password
export const StrongPassword: Story = {
  args: {
    password: 'MySecure123!',
  },
  parameters: {
    docs: {
      description: {
        story: 'A strong password that meets all validation requirements.',
      },
    },
  },
};

// Interactive story for testing
export const Interactive: Story = {
  args: {
    password: 'Test123!',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example where you can modify the password to see real-time validation.',
      },
    },
  },
};

// Story showing progressive validation
export const ProgressiveValidation: Story = {
  render: () => {
    const passwordSteps = [
      'p',
      'pa',
      'pass',
      'passw',
      'password',
      'Password',
      'Password1',
      'Password1!',
    ];

    return (
      <div className='space-y-6'>
        {passwordSteps.map((pwd, index) => (
          <div key={index} className='border border-gray-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold mb-2'>
              Step {index + 1}: "{pwd}"
            </h3>
            <PasswordChecker password={pwd} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the password checker validates at each step of password creation.',
      },
    },
  },
};

// Story with edge cases
export const EdgeCases: Story = {
  render: () => {
    const edgeCases = [
      { label: 'Empty password', password: '' },
      { label: 'Only spaces', password: '        ' },
      { label: 'Only numbers', password: '12345678' },
      { label: 'Only uppercase', password: 'ABCDEFGH' },
      { label: 'Only lowercase', password: 'abcdefgh' },
      { label: 'Only special chars', password: '@#$%^&*!' },
      { label: 'Very long password', password: 'ThisIsAVeryLongPasswordWithManyCharacters123!' },
      { label: 'Unicode characters', password: 'Pässwörd123!' },
    ];

    return (
      <div className='space-y-6'>
        {edgeCases.map((testCase, index) => (
          <div key={index} className='border border-gray-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold mb-2'>{testCase.label}</h3>
            <p className='text-sm text-gray-600 mb-3'>Password: "{testCase.password}"</p>
            <PasswordChecker password={testCase.password} />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests various edge cases and unusual password inputs.',
      },
    },
  },
};

// Story for accessibility testing
export const AccessibilityTest: Story = {
  args: {
    password: 'Test123!',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Story specifically for testing accessibility features like screen reader compatibility.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focusable-content',
            enabled: true,
          },
        ],
      },
    },
  },
};
