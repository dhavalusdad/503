import React from 'react';

import { useParams } from 'react-router-dom';

import { useGetTotalUnreadCount } from '@/api/chat';
import type { MessageMarkedAsReadEventType, MessageType } from '@/features/chat/types';
import { useSocketListener } from '@/hooks/socket';

interface ChatUnreadBadgeProps {
  size?: number; // diameter in pixels
  active?: boolean; // highlight state
  compact?: boolean; // if true, show only dot instead of number
}

const ChatUnreadBadge: React.FC<ChatUnreadBadgeProps> = ({
  size = 26,
  active = false,
  compact = true,
}) => {
  const { chatId = '' } = useParams();
  const { data: totalUnread, isLoading, refetch } = useGetTotalUnreadCount();

  useSocketListener<MessageType>('newMessage', data => {
    if (!chatId || chatId !== data.chat_id) {
      refetch();
    }
  });

  useSocketListener<MessageMarkedAsReadEventType>('messagesMarkedAsRead', data => {
    if (!chatId || chatId !== data.sessionId) {
      refetch();
    }
  });

  if (isLoading) return null;
  if (!totalUnread || totalUnread === 0) return null; // hide if 0

  // Define default colors
  const defaultBg = '#43573C';
  const defaultText = '#FFFFFF';

  // Swap colors if active
  const bgColor = active ? defaultText : defaultBg;
  const textColor = active ? defaultBg : defaultText;

  // Compact mode (dot only)
  if (compact) {
    return (
      <div
        className='rounded-full m-1 w-2 h-2 min-w-2 min-h-2'
        style={{ backgroundColor: bgColor }}
      />
    );
  }

  // Full badge mode
  return (
    <div
      className='flex items-center justify-center text-xs font-semibold rounded-full'
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {totalUnread > 99 ? '99+' : totalUnread}
    </div>
  );
};

export default ChatUnreadBadge;
