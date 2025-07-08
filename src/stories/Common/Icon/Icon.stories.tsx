// src/components/common/Icon/Icon.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import Icon from "./index";

const meta: Meta<typeof Icon> = {
  title: "Common/Icon",
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: "select",
      options: [
        "notification",
        "dropDown",
        "profile",
        "leftarrow",
        "dashboard",
        "appointment",
        "client",
        "calendar",
        "chat",
        "settings",
      ],
    },
    fill: { control: "color" },
    stroke: { control: "color" },
    isSpinner: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Notification: Story = {
  args: {
    name: "notification",
    className: "w-8 h-8",
    fill: "#000000",
    stroke: "#000000",
  },
};

export const SpinnerIcon: Story = {
  args: {
    name: "notification",
    isSpinner: true,
    className: "w-8 h-8",
  },
};
