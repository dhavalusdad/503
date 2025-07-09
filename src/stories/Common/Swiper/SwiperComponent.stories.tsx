// components/SwiperComponent.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import SwiperComponent from "./index";

const meta: Meta<typeof SwiperComponent> = {
  title: "Common/Swiper",
  component: SwiperComponent,
  tags: ["autodocs"],
  argTypes: {
    slidesPerView: { control: "number" },
    spaceBetween: { control: "number" },
    navigation: { control: "boolean" },
    pagination: { control: "boolean" },
    autoplayDelay: { control: "number" },
  },
};

export default meta;

type Story = StoryObj<typeof SwiperComponent>;

const sampleSlides = [
  <div
    key="1"
    style={{
      backgroundColor: "#f87171",
      height: "200px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    Slide 1
  </div>,
  <div
    key="2"
    style={{
      backgroundColor: "#60a5fa",
      height: "200px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    Slide 2
  </div>,
  <div
    key="3"
    style={{
      backgroundColor: "#34d399",
      height: "200px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    Slide 3
  </div>,
];

export const Default: Story = {
  args: {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: false,
    pagination: true,
    children: sampleSlides,
  },
};

export const WithNavigation: Story = {
  args: {
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: true,
    pagination: true,
    children: sampleSlides,
  },
};

export const WithAutoplay: Story = {
  args: {
    slidesPerView: 1,
    spaceBetween: 10,
    autoplayDelay: 2000,
    navigation: false,
    pagination: true,
    children: sampleSlides,
  },
};

export const MultipleSlides: Story = {
  args: {
    slidesPerView: 2,
    spaceBetween: 15,
    pagination: true,
    children: sampleSlides,
  },
};
