import { useState, useRef, useEffect } from 'react';

import clsx from 'clsx';

import { useVideoCall } from '@/features/video-call/store/useVideoCall';
import { formatTimestamp } from '@/features/video-call/utils/format';
import { fetchChatMessages } from '@/features/video-call/utils/twilio';
import {
  getTwilioIdentity,
  getTwilioUserId,
} from '@/features/video-call/utils/twilioSessionStorage';
import { useSocketListener } from '@/hooks/socket';
import type { ChatMessage } from '@/redux/ducks/videoCall';
import { socket } from '@/socket';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';

interface ChatPanelProps {
  onClose: () => void;
  parentClassName?: string;
}

export function ChatPanel({ onClose, parentClassName }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const storedIdentity = getTwilioIdentity();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const { room } = useVideoCall();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when panel opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (!message.trim() || !room?.sid) return;
    const chatMessage = {
      text: message.trim(),
      sender_identity: storedIdentity || '',
      session_id: room?.sid,
      user_id: getTwilioUserId(),
    };

    socket.emit('chatMessage', chatMessage);

    if (storedIdentity) {
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!room?.sid) return;

    const loadMessages = async () => {
      if (!room?.sid) return;
      const messagesFromBackend = await fetchChatMessages(room.sid);
      setChatMessages(messagesFromBackend.data);
    };

    loadMessages();

    if (storedIdentity) {
      socket.emit('joinRoom', {
        roomId: room.sid,
        userId: storedIdentity,
      });
    }
  }, [room?.sid, storedIdentity]);

  useSocketListener<ChatMessage>('chatMessage', message => {
    const updatedMessage = {
      id: message.id,
      text: message.text,
      sender_identity: message.sender_identity,
      created_at: message.created_at,
    };
    setChatMessages(prev => [...prev, updatedMessage]);
  });

  return (
    <>
      {/* Backdrop for mobile */}
      {/* <div className='md:hidden fixed inset-0 bg-black/50 z-[998]' onClick={onClose} /> */}

      <div className='w-[calc(100%-32px)] sm:w-387px rounded-20px z-50 h-full absolute right-4 xl:right-auto xl:relative'>
        <div className={clsx('flex flex-col bg-white rounded-20px h-full', parentClassName)}>
          {/* Header */}
          <div className='flex items-center justify-between p-5 bg-surface rounded-t-20px'>
            <h2 className='text-xl font-semibold leading-6 text-blackdark'>Chat</h2>
            <Button
              onClick={onClose}
              variant='none'
              className='text-blackdark !p-0'
              parentClassName='h-6'
              icon={<Icon name='x' className='icon-wrapper w-6 h-6' />}
            />
          </div>

          {/* Messages */}
          <div className='p-4 relative flex-1 overflow-hidden'>
            <div className='h-full overflow-y-auto scroll-disable flex flex-col gap-3 '>
              {Array.isArray(chatMessages) && chatMessages?.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-2 text-blackdark h-full'>
                  <p className='text-xl font-semibold'>No messages yet</p>
                  <p className='text-xl font-semibold'>Start the conversation!</p>
                </div>
              ) : (
                chatMessages?.map((msg: ChatMessage) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_identity === storedIdentity ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className='flex flex-col gap-1.5'>
                      <span
                        className={clsx(
                          'text-xs leading-3 font-normal block text-primarygray',
                          msg.sender_identity !== storedIdentity ? '' : 'text-end'
                        )}
                      >
                        {formatTimestamp(msg.created_at)}
                      </span>
                      <div
                        className={`p-2.5 rounded-2xl inline-flex flex-col gap-1.5 ${
                          msg.sender_identity === storedIdentity
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-surface text-blackdark rounded-tl-none'
                        }`}
                      >
                        {msg.sender_identity !== storedIdentity && (
                          <span className={clsx('text-xs leading-3 font-bold text-red-600')}>
                            {msg.sender_identity.split('-')[0]}
                          </span>
                        )}
                        <p
                          className={clsx(
                            'text-sm leading-3.5 font-semibold break-word',
                            msg.sender_identity !== storedIdentity ? 'text-blackdark' : 'text-white'
                          )}
                        >
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className='p-4 pt-0'>
            <div className='flex items-center gap-2.5 justify-between relative'>
              <InputField
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Type Your message'
                maxLength={500}
                type='text'
                inputClass='bg-Gray'
                parentClassName='w-full'
              />
              <Button
                onClick={handleSendMessage}
                isDisabled={!message.trim()}
                variant='filled'
                className='rounded-10px'
                parentClassName='flex'
                icon={<Icon name='send' className='icon-wrapper w-5 h-5 text-white' />}
              />
            </div>

            {isTyping && <div className='text-xs text-primarygray mt-2'>Someone is typing...</div>}
          </div>
        </div>
      </div>
    </>
  );
}
