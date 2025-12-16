import { useState } from 'react';

import RichTextEditorField from '@/stories/Common/RichTextEditer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Common/RichTextEditor',
  component: RichTextEditorField,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label displayed above the editor field.',
    },
    placeholder: {
      control: 'text',
      description: 'Text shown inside the editor when it is empty.',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disables the editor, making it read-only.',
    },
    isShowToolbar: {
      control: 'boolean',
      description: 'Toggles visibility of the formatting toolbar.',
    },
    isAllowFormatting: {
      control: 'boolean',
      description:
        'Determines whether text formatting (bold, italic, lists, etc.) is enabled in the toolbar.',
    },
    theme: {
      control: 'select',
      options: ['snow', 'bubble', ''],
      description:
        'Defines the Quill editor theme — `snow` for standard toolbar, `bubble` for inline toolbar, or empty string for minimal mode.',
    },
    error: {
      control: 'text',
      description: 'Displays an error message below the editor.',
    },
    isRequired: {
      control: 'boolean',
      description: 'If true, adds a red asterisk (*) beside the label.',
    },
    className: {
      control: 'text',
      description: 'Custom CSS classes for the editor container.',
    },
    labelClassName: {
      control: 'text',
      description: 'Custom CSS classes applied to the label.',
    },
    errorClass: {
      control: 'text',
      description: 'Custom CSS classes for the error message.',
    },
    parentClassName: {
      control: 'text',
      description: 'Custom CSS classes applied to the outermost wrapper.',
    },
    value: {
      control: 'text',
      description: 'Current value/content of the editor.',
    },
    onChange: {
      action: 'changed',
      description: 'Callback function triggered when editor content changes.',
    },
  },
} satisfies Meta<typeof RichTextEditorField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return <RichTextEditorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Start writing here...',
    isShowToolbar: true,
    isAllowFormatting: true,
    theme: 'snow',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState('This editor is disabled.');
    return <RichTextEditorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Disabled Editor',
    isDisabled: true,
  },
};

export const WithError: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return <RichTextEditorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Editor with Error',
    error: 'This field is required',
    isRequired: true,
  },
};

export const WithoutToolbar: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return <RichTextEditorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Minimal Editor',
    isShowToolbar: false,
    placeholder: 'Toolbar is hidden...',
  },
};

export const ReadOnlyContent: Story = {
  render: args => {
    const [value, setValue] = useState('This is a read-only editor with some content.');
    return <RichTextEditorField {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Read-only',
    isDisabled: true,
  },
};
