import '../../../index.css';
import { useState } from 'react';

import Button from '../Button';

import MediaViewerModal, { type MediaViewerModalProps, type MediaFile } from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MediaViewerModal> = {
  title: 'Common/MediaViewerModal',
  component: MediaViewerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    files: { control: 'object' },
    initialIndex: { control: 'number' },
    showNavigation: { control: 'boolean' },
    showCounter: { control: 'boolean' },
    allowDownload: { control: 'boolean' },
    modalSize: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof MediaViewerModal>;

// Sample media files for stories
const sampleImages: MediaFile[] = [
  {
    url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    type: 'image/jpeg',
    name: 'Beach Sunset.jpg',
    id: '1',
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    type: 'image/jpeg',
    name: 'Mountain Landscape.jpg',
    id: '2',
  },
  {
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
    type: 'image/jpeg',
    name: 'Forest Path.jpg',
    id: '3',
  },
];

const singleImage: MediaFile[] = [
  {
    url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    type: 'image/jpeg',
    name: 'Beautiful Beach.jpg',
    id: '1',
  },
];

const mixedMedia: MediaFile[] = [
  {
    url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    type: 'image/jpeg',
    name: 'Image File.jpg',
    id: '1',
  },
  {
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    type: 'application/pdf',
    name: 'Sample Document.pdf',
    id: '2',
  },
  {
    url: 'data:text/plain;base64,SGVsbG8gV29ybGQhClRoaXMgaXMgYSBzYW1wbGUgdGV4dCBmaWxlLg==',
    type: 'text/plain',
    name: 'Notes.txt',
    id: '3',
  },
];

// Wrapper component with open/close state
const MediaViewerModalWrapper = (args: MediaViewerModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button variant='filled' title='Open Media Viewer' onClick={() => setIsOpen(true)} />
      <MediaViewerModal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

// Basic Stories
export const Default: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    initialIndex: 0,
  },
};

export const SingleImage: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: singleImage,
    initialIndex: 0,
  },
};

export const MultipleImages: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    initialIndex: 0,
    showCounter: true,
  },
};

export const StartAtMiddle: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    initialIndex: 1,
    showCounter: true,
  },
};

export const MixedMediaTypes: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: mixedMedia,
    initialIndex: 0,
    showCounter: true,
  },
};

export const NoNavigation: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    initialIndex: 0,
    showNavigation: false,
    showCounter: false,
  },
};

export const NoCounter: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    initialIndex: 0,
    showCounter: false,
  },
};

export const NoDownload: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: [
      {
        url: 'data:application/octet-stream;base64,dGVzdA==',
        type: 'application/octet-stream',
        name: 'Unknown File.bin',
        id: '1',
      },
    ],
    allowDownload: false,
  },
};

export const LargeModal: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    modalSize: 'xl',
  },
};

export const WithNavigationCallback: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    initialIndex: 0,
    onNavigate: index => {
      console.log('Navigated to index:', index);
    },
  },
};

export const EmptyFiles: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: [],
    initialIndex: 0,
  },
};

export const PDFDocument: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: [
      {
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'application/pdf',
        name: 'Sample PDF Document.pdf',
        id: '1',
      },
    ],
  },
};

export const UnsupportedFileType: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: [
      {
        url: 'https://example.com/file.zip',
        type: 'application/zip',
        name: 'Archive.zip',
        id: '1',
      },
    ],
    allowDownload: true,
  },
};

// Interactive playground
export const Playground: Story = {
  render: args => <MediaViewerModalWrapper {...args} />,
  args: {
    files: sampleImages,
    initialIndex: 0,
    showNavigation: true,
    showCounter: true,
    allowDownload: true,
    modalSize: 'lg',
  },
};
