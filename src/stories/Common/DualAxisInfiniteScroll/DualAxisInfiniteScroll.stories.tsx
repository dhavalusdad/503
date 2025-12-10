import '../../../index.css';
import { useState, useRef } from 'react';

import DualAxisInfiniteScroll, { type DualAxisInfiniteScrollProps } from './index';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DualAxisInfiniteScroll> = {
  title: 'Common/DualAxisInfiniteScroll',
  component: DualAxisInfiniteScroll,
  tags: ['autodocs'],
  args: {
    hasMoreBottom: true,
    hasMoreTop: true,
    loading: false,
    containerClassName: 'h-96 overflow-y-auto border border-gray-300 p-4',
  },
};

export default meta;

type Story = StoryObj<typeof DualAxisInfiniteScroll>;

export const Default: Story = {
  render: (args: DualAxisInfiniteScrollProps) => {
    const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const handleLoadTop = () => {
      setLoading(true);
      setTimeout(() => {
        const newItems = Array.from({ length: 10 }, (_, i) => `New Top Item ${i + 1}`);
        setItems(prev => [...newItems, ...prev]);
        setLoading(false);
      }, 1000);
    };

    const handleLoadBottom = () => {
      setLoading(true);
      setTimeout(() => {
        const newItems = Array.from({ length: 10 }, (_, i) => `New Bottom Item ${i + 1}`);
        setItems(prev => [...prev, ...newItems]);
        setLoading(false);
      }, 1000);
    };

    return (
      <DualAxisInfiniteScroll
        {...args}
        containerRef={containerRef}
        triggerOnHasMoreTop={handleLoadTop}
        triggerOnHasMoreBottom={handleLoadBottom}
        loading={loading}
      >
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className='p-2 border-b border-gray-200'>
            {item}
          </div>
        ))}
        {loading && <div className='p-4 text-center text-gray-500'>Loading...</div>}
      </DualAxisInfiniteScroll>
    );
  },
  args: {
    hasMoreBottom: true,
    hasMoreTop: true,
    loading: false,
    containerClassName: 'h-96 overflow-y-auto border border-gray-300 p-4',
  },
};

export const OnlyBottomLoad: Story = {
  render: (args: DualAxisInfiniteScrollProps) => {
    const [items, setItems] = useState(Array.from({ length: 15 }, (_, i) => `Item ${i + 1}`));
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const handleLoadBottom = () => {
      setLoading(true);
      setTimeout(() => {
        const newItems = Array.from({ length: 10 }, (_, i) => `New Item ${items.length + i + 1}`);
        setItems(prev => [...prev, ...newItems]);
        setLoading(false);
      }, 1000);
    };

    return (
      <DualAxisInfiniteScroll
        {...args}
        containerRef={containerRef}
        triggerOnHasMoreBottom={handleLoadBottom}
        loading={loading}
      >
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className='p-3 border-b border-gray-200 bg-blue-50'>
            {item}
          </div>
        ))}
        {loading && <div className='p-4 text-center text-blue-500'>Loading more items...</div>}
      </DualAxisInfiniteScroll>
    );
  },
  args: {
    hasMoreBottom: true,
    hasMoreTop: false,
    loading: false,
    containerClassName: 'h-80 overflow-y-auto border-2 border-blue-300 rounded-lg p-4',
  },
};

export const OnlyTopLoad: Story = {
  render: (args: DualAxisInfiniteScrollProps) => {
    const [items, setItems] = useState(Array.from({ length: 15 }, (_, i) => `Message ${i + 1}`));
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const handleLoadTop = () => {
      setLoading(true);
      setTimeout(() => {
        const newItems = Array.from({ length: 10 }, (_, i) => `Old Message ${i + 1}`);
        setItems(prev => [...newItems, ...prev]);
        setLoading(false);
      }, 1000);
    };

    return (
      <DualAxisInfiniteScroll
        {...args}
        containerRef={containerRef}
        triggerOnHasMoreTop={handleLoadTop}
        loading={loading}
      >
        {loading && <div className='p-4 text-center text-green-500'>Loading older messages...</div>}
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className='p-3 border-b border-gray-200 bg-green-50'>
            {item}
          </div>
        ))}
      </DualAxisInfiniteScroll>
    );
  },
  args: {
    hasMoreBottom: false,
    hasMoreTop: true,
    loading: false,
    containerClassName: 'h-80 overflow-y-auto border-2 border-green-300 rounded-lg p-4',
  },
};

export const CustomThreshold: Story = {
  render: (args: DualAxisInfiniteScrollProps) => {
    const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const handleLoadTop = () => {
      setLoading(true);
      setTimeout(() => {
        const newItems = Array.from({ length: 5 }, (_, i) => `Top Item ${i + 1}`);
        setItems(prev => [...newItems, ...prev]);
        setLoading(false);
      }, 800);
    };

    const handleLoadBottom = () => {
      setLoading(true);
      setTimeout(() => {
        const newItems = Array.from({ length: 5 }, (_, i) => `Bottom Item ${i + 1}`);
        setItems(prev => [...prev, ...newItems]);
        setLoading(false);
      }, 800);
    };

    return (
      <div>
        <p className='mb-2 text-sm text-gray-600'>Scroll</p>
        <DualAxisInfiniteScroll
          {...args}
          containerRef={containerRef}
          triggerOnHasMoreTop={handleLoadTop}
          triggerOnHasMoreBottom={handleLoadBottom}
          loading={loading}
        >
          {items.map((item, index) => (
            <div key={`${item}-${index}`} className='p-2 border-b border-gray-200 bg-purple-50'>
              {item}
            </div>
          ))}
          {loading && <div className='p-4 text-center text-purple-500'>Loading...</div>}
        </DualAxisInfiniteScroll>
      </div>
    );
  },
  args: {
    hasMoreBottom: true,
    hasMoreTop: true,
    loading: false,
    containerClassName: 'h-96 overflow-y-auto border-2 border-purple-300 rounded-lg p-4',
  },
};

export const ChatExample: Story = {
  render: (args: DualAxisInfiniteScrollProps) => {
    const [messages, setMessages] = useState([
      { id: 1, text: 'Hello there!', sender: 'user' },
      { id: 2, text: 'Hi! How can I help you?', sender: 'bot' },
      { id: 3, text: 'I need help with something', sender: 'user' },
      { id: 4, text: 'Sure! What do you need help with?', sender: 'bot' },
    ]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    const loadOlderMessages = () => {
      setLoading(true);
      setTimeout(() => {
        const olderMessages = [
          { id: messages.length + 1, text: 'This is an older message', sender: 'user' },
          { id: messages.length + 2, text: 'And this is even older', sender: 'bot' },
        ];
        setMessages(prev => [...olderMessages, ...prev]);
        setLoading(false);
      }, 1000);
    };

    return (
      <DualAxisInfiniteScroll
        {...args}
        containerRef={containerRef}
        triggerOnHasMoreTop={loadOlderMessages}
        loading={loading}
      >
        {loading && <div className='p-4 text-center text-gray-500'>Loading older messages...</div>}
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-3 m-2 rounded-lg max-w-xs ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {message.text}
          </div>
        ))}
      </DualAxisInfiniteScroll>
    );
  },
  args: {
    hasMoreBottom: false,
    hasMoreTop: true,
    loading: false,
    containerClassName: 'h-96 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50',
  },
};

export const NoMoreContent: Story = {
  render: (args: DualAxisInfiniteScrollProps) => {
    const [items] = useState(Array.from({ length: 10 }, (_, i) => `Static Item ${i + 1}`));
    const containerRef = useRef(null);

    return (
      <DualAxisInfiniteScroll
        {...args}
        containerRef={containerRef}
        triggerOnHasMoreTop={() => console.log('No more top content')}
        triggerOnHasMoreBottom={() => console.log('No more bottom content')}
      >
        <div className='p-4 text-center text-gray-400 border-b'>No more content above</div>
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className='p-3 border-b border-gray-200'>
            {item}
          </div>
        ))}
        <div className='p-4 text-center text-gray-400'>No more content below</div>
      </DualAxisInfiniteScroll>
    );
  },
  args: {
    hasMoreBottom: false,
    hasMoreTop: false,
    loading: false,
    containerClassName: 'h-80 overflow-y-auto border border-gray-300 rounded p-4',
  },
};
