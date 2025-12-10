import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import ChatWelcome from '@/features/chat/components/ChatWelcome';
import ConversationsList from '@/features/chat/components/ConversationList';
import ConversationView from '@/features/chat/components/ConversationView';

const Chat: React.FC = () => {
  const { chatId } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const handleCollapse = (status: boolean) => {
    if (isMobile) {
      setIsCollapsed(status);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically collapse sidebar on mobile when a chat is selected
  useEffect(() => {
    if (isMobile && chatId) {
      setIsCollapsed(true);
    } else if (isMobile && !chatId) {
      setIsCollapsed(false);
    }
  }, [chatId, isMobile]);

  // Determine what to show based on screen size and state
  const showConversationsList = !isMobile || !isCollapsed;
  const showConversationView = chatId && (!isMobile || isCollapsed);
  const showWelcome = !chatId && !isMobile;

  return (
    <div className='h-full flex gap-5 relative'>
      {showConversationsList && <ConversationsList handleCollapse={handleCollapse} />}
      {showConversationView && <ConversationView handleCollapse={setIsCollapsed} />}
      {showWelcome && <ChatWelcome />}
    </div>
  );
};

export default Chat;
