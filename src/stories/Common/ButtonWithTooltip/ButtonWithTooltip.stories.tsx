import '../../../index.css';

import Icon from '../Icon';

import ButtonWithTooltip, { type ButtonWithTooltipProps } from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ButtonWithTooltip> = {
  title: 'Common/ButtonWithTooltip',
  component: ButtonWithTooltip,
  tags: ['autodocs'],
  args: {
    variant: 'filled',
    title: 'Hover Me',
    tooltipLabel: 'Tooltip text here',
    tooltipPlacement: 'top',
  },
};

export default meta;

type Story = StoryObj<typeof ButtonWithTooltip>;

export const Default: Story = {
  args: {},
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    tooltipLabel: 'Outline Button Tooltip',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'filled',
    title: 'Profile',
    icon: <Icon name='calendar' />,
    isIconFirst: true,
    tooltipLabel: 'Calendar button',
  },
};

export const DisabledButton: Story = {
  args: {
    variant: 'filled',
    title: 'Disabled',
    isDisabled: true,
    tooltipLabel: 'This button is disabled',
  },
};

export const TooltipDisabled: Story = {
  args: {
    variant: 'filled',
    title: 'No Tooltip',
    tooltipDisable: true,
    tooltipLabel: 'This will not show',
  },
};

export const CustomTooltipClass: Story = {
  args: {
    variant: 'filled',
    title: 'Custom Tooltip',
    tooltipLabel: 'Styled Tooltip',
    tooltipClassName: 'bg-black text-white px-4 py-2 rounded shadow-xl',
  },
};

export const WithChildren: Story = {
  render: (args: ButtonWithTooltipProps) => (
    <ButtonWithTooltip {...args}>
      <span className='text-sm font-semibold'>🚀 Launch</span>
    </ButtonWithTooltip>
  ),
  args: {
    variant: 'filled',
    tooltipLabel: 'Launch button tooltip',
  },
};
