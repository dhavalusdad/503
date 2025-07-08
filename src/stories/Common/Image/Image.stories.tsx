import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from './index';

const meta: Meta<typeof Image> = {
  title: 'Common/Image',
  component: Image,
  tags: ['autodocs'],
  args: {
    width: 100,
    height: 100,
    className: 'rounded-full overflow-hidden w-[100px] h-[100px]',
    imageClassName: 'object-cover',
    alt: 'Profile Image',
  },
};

export default meta;

type Story = StoryObj<typeof Image>;

export const ServerImage: Story = {
  args: {
    imgPath: 'https://picsum.photos/201',
  },
};

export const FallbackInitials: Story = {
  args: {
    imgPath: '',
    firstName: 'John',
    lastName: 'Doe',
  },
};

export const FallbackDefaultImage: Story = {
  args: {
    imgPath: 'https://picsum.photos/200',
  },
};
