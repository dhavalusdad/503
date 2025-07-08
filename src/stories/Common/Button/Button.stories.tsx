import type { Meta, StoryObj } from "@storybook/react-vite";
import Button, { type ButtonProps } from "./index";
import "../../../index.css";
import Icon from "../Icon";

const meta: Meta<typeof Button> = {
  title: "Common/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    variant: "filled",
    title: "Click Me",
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Filled: Story = {
  args: {
    variant: "filled",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const None: Story = {
  args: {
    variant: "none",
  },
};

export const WithIconStart: Story = {
  args: {
    variant: "filled",
    title: "Profile",
    icon: <Icon name="calendar" />,
    isIconFirst: true,
  },
};

export const WithIconEnd: Story = {
  args: {
    variant: "filled",
    title: "Profile",
    icon: <Icon name="calendar" />,
    isIconFirst: false,
  },
};

export const Loading: Story = {
  args: {
    variant: "filled",
    title: "Loading...",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: "filled",
    title: "Disabled",
    isDisabled: true,
  },
};

export const CustomClassNames: Story = {
  args: {
    variant: "filled",
    title: "Styled Button",
    className: "text-xl px-6 py-2",
    titleClassName: "underline",
  },
};

export const OnlyIcon: Story = {
  args: {
    variant: "outline",
    icon: <Icon name="calendar" />,
  },
};

export const WithChildren: Story = {
  render: (args: ButtonProps) => (
    <Button {...args}>
      <span className="text-sm font-semibold">🚀 Launch</span>
    </Button>
  ),
  args: {
    variant: "filled",
  },
};
