// stories/TabNavigation.stories.tsx
import { useState } from 'react';

import TabNavigation from '@/stories/Common/TabNavigation';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof TabNavigation> = {
  title: 'Components/TabNavigation',
  component: TabNavigation,
  tags: ['autodocs'],
  argTypes: {
    tabs: { control: [] },
    activeTab: { control: 'text' },
    onTabChange: { action: 'tab changed' },
  },
};

export default meta;
type Story = StoryObj<typeof TabNavigation>;

export const Default: Story = {
  render: args => {
    const [activeTab, setActiveTab] = useState(args.activeTab || args.tabs[0]);

    return (
      <TabNavigation
        {...args}
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          args.onTabChange?.(tab);
        }}
      />
    );
  },
  args: {
    tabs: ['Basic Details', 'Experience', 'License'],
    activeTab: 'Basic Details',
  },
};
