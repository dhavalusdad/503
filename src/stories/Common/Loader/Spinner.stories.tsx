import type { Meta, StoryObj } from "@storybook/react-vite";
import SectionLoader from "./Spinner";

const meta: Meta<typeof SectionLoader> = {
  title: "Common/Loader",
  component: SectionLoader,
  tags: ["autodocs"],
  argTypes: {
    className: { control: "text" },
    size: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof SectionLoader>;

export const Default: Story = {
  args: {},
};

export const CustomSize: Story = {
  args: {
    size: "h-6 w-6",
  },
};