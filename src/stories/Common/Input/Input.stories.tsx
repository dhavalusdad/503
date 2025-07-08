import  { useState } from "react";
import type{ Meta, StoryObj } from "@storybook/react-vite";
import Input from "./index";

const meta: Meta<typeof Input> = {
  title: "Common/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    type: { control: "text" },
    placeholder: { control: "text" },
    value: { control: "text" },
    name: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
  args: {
    label: "Text",
    placeholder: "Enter text",
    type: "text",
  },
};

export const PasswordInput: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
  args: {
    label: "Password",
    placeholder: "Enter password",
  },
};

export const DisabledInput: Story = {
  args: {
    label: "Disabled",
    placeholder: "Can't type here",
    value: "Disabled value",
    disabled: true,
    onChange: () => {},
  },
};

export const NoLabelInput: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
  args: {
    placeholder: "No label",
  },
};
