import React from 'react';

import { useParams } from 'react-router-dom';

import ChatWelcome from '@/features/chat/components/ChatWelcome';
import ConversationsList from '@/features/chat/components/ConversationList';
import ConversationView from '@/features/chat/components/ConversationView';

const Chat: React.FC = () => {
  const { chatId } = useParams();

  return (
    <div className='h-full flex sm:flex-row flex-col gap-5'>
      <ConversationsList />
      {chatId ? <ConversationView /> : <ChatWelcome />}
    </div>
  );
};

export default Chat;
