import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { axiosGet } from '@/api/axios';
import {
  useInfiniteChatSessions,
  useInfiniteMessage,
  useMarkMessagesAsRead,
  useSearchChatMessages,
  useSendChatMessage,
  useUploadMessageFiles,
} from '@/api/chat';
import { chatQueryKeys } from '@/api/common/chat.queryKey';
import ChatHeader from '@/features/chat/components/ConversationView/ChatHeader';
import MessageBubble from '@/features/chat/components/ConversationView/MessageBubble';
import MessageInput from '@/features/chat/components/ConversationView/MessageInput';
import SessionEndedMessage from '@/features/chat/components/ConversationView/SessionEndedMessage';
import type {
  ChatMessagesPage,
  ChatSearchResult,
  ChatSession,
  ChatSessionsPage,
  DeliveryStatus,
  MessageType,
  PaginatedMessages,
  PresenceUpdate,
  ReadInfoType,
} from '@/features/chat/types';
import { DATE_FORMATS, formatDateLabel } from '@/helper';
import { useSocketListener } from '@/hooks/socket';
import { currentUser } from '@/redux/ducks/user';
import DualAxisInfiniteScroll from '@/stories/Common/DualAxisInfiniteScroll';
import Spinner from '@/stories/Common/Spinner';

import {
  groupMessagesByDate,
  updateAllInfiniteQueryPages,
  updateInfiniteQueryPage,
  validateFiles,
} from '../../Utilities';

const MAX_FILES = 4;

const ConversationView: React.FC<{
  handleCollapse?: (status: boolean) => void;
}> = ({ handleCollapse }) => {
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { chatId = '' } = useParams();
  const queryClient = useQueryClient();
  const user = useSelector(currentUser);

  // State
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [messageSearchValue, setMessageSearchValue] = useState('');
  const [activeMessageSearchData, setActiveMessageSearchData] = useState<ChatSearchResult | null>(
    null
  );
  const [highlightId, setHighlightId] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');

  // API Hooks
  const {
    data: messages = [],
    hasNextPage,
    fetchNextPage,
    hasPreviousPage,
    fetchPreviousPage,
    isLoading,
  } = useInfiniteMessage({
    sessionId: chatId,
    limit: 20,
  });

  const { data } = useInfiniteChatSessions({
    enabled: false,
  });

  const conversations = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? [];
  }, [data]);

  const { mutate: markAsRead } = useMarkMessagesAsRead();

  // Mutation Hooks
  const { mutate: sendMessage } = useSendChatMessage({
    onSuccess: async response => {
      await queryClient.setQueryData(
        chatQueryKeys.messages(activeChat?.id as string),
        (oldData: PaginatedMessages) =>
          updateInfiniteQueryPage(oldData, 0, items => [
            { ...response.data, is_own: true },
            ...items,
          ])
      );
      setMessageText('');
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0;
      }
      setIsSendingMessage(false);
    },
  });

  const { mutate: sendAttachment } = useUploadMessageFiles({
    onSuccess: response => {
      queryClient.setQueryData(
        chatQueryKeys.messages(activeChat?.id as string),
        (oldData: PaginatedMessages) =>
          updateInfiniteQueryPage(oldData, 0, items => [
            { ...response.data, is_own: true },
            ...items,
          ])
      );
      setSelectedFiles([]);
      setMessageText('');
    },
  });

  // Event Handlers
  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newFiles = Array.from(files);
      const validation = validateFiles(newFiles);

      if (!validation.valid) {
        setFileError(validation.error);
        e.target.value = '';
        return;
      }

      let allowedFiles = newFiles;
      if (selectedFiles.length + newFiles.length > MAX_FILES) {
        const remainingSlots = MAX_FILES - selectedFiles.length;
        allowedFiles = newFiles.slice(0, remainingSlots);
        setFileError(`You can only attach up to ${MAX_FILES} files.`);
      } else {
        setFileError('');
      }

      setSelectedFiles(prev => [...prev, ...allowedFiles]);
      e.target.value = '';
    },
    [selectedFiles.length]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileError('');
  }, []);

  const handleSend = useCallback(() => {
    if (!activeChat) return;

    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append('message_files', file));
      formData.append('sessionId', activeChat.id);
      formData.append('message', messageText.trim());
      sendAttachment(formData);
    } else {
      if (!messageText.trim()) return;
      setIsSendingMessage(true);
      sendMessage({
        sessionId: activeChat.id,
        message: messageText.trim(),
        messageType: 'Text',
      });
    }
  }, [activeChat, selectedFiles, messageText, sendAttachment, sendMessage]);

  const handleMessageChange = useCallback(
    (text: string) => {
      setMessageText(text);
      if (fileError) setFileError('');
    },
    [fileError]
  );

  // Socket Listeners
  useSocketListener<MessageType>(
    'newMessage',
    useCallback(
      data => {
        if (activeChat && activeChat.id === data.chat_id) {
          queryClient.setQueryData(
            chatQueryKeys.messages(data.chat_id),
            (oldData: PaginatedMessages) =>
              updateInfiniteQueryPage(oldData, 0, items => [{ ...data, is_own: false }, ...items])
          );
          markAsRead({ sessionId: activeChat.id });
        }
      },
      [activeChat, queryClient, markAsRead]
    )
  );

  useSocketListener<ReadInfoType>(
    'messagesRead',
    useCallback(
      data => {
        if (activeChat && activeChat.id === data.sessionId) {
          queryClient.setQueryData(
            chatQueryKeys.messages(activeChat.id),
            (oldData: PaginatedMessages) =>
              updateAllInfiniteQueryPages(oldData, items =>
                items.map((msg: MessageType) =>
                  msg.is_own
                    ? { ...msg, delivery_status: 'Read' as DeliveryStatus, is_read: true }
                    : msg
                )
              )
          );
        }

        queryClient.setQueryData(
          chatQueryKeys.sessions(),
          (oldData: InfiniteData<ChatSessionsPage> | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map(page => ({
                ...page,
                items: page.items.map(session =>
                  session.id === data.sessionId &&
                  session.last_message &&
                  data.messageIds.includes(session.last_message.id)
                    ? {
                        ...session,
                        last_message: {
                          ...session.last_message,
                          delivery_status: 'Read',
                        },
                      }
                    : session
                ),
              })),
            };
          }
        );
      },
      [activeChat, queryClient]
    )
  );

  useSocketListener<PresenceUpdate>(
    'user:presence_update',
    useCallback(
      data => {
        if (activeChat?.recipient?.user_id === data.userId) {
          setActiveChat(prev =>
            prev
              ? {
                  ...prev,
                  recipient: {
                    ...prev.recipient,
                    is_online: data.isOnline,
                  },
                }
              : prev
          );
        }
      },
      [activeChat, setActiveChat]
    )
  );

  // Effects
  useEffect(() => {
    if (activeChat?.id != chatId && conversations.length > 0) {
      const chat = conversations.find(c => c.id === chatId);
      if (chat) {
        setActiveChat(chat || null);
      }
    }
  }, [chatId, conversations]);

  // Memoized Values
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  const handleCloseSearch = () => {
    setActiveMessageSearchData(null);
    setHighlightId('');
    setDebouncedSearchValue('');
    setMessageSearchValue('');
  };

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchValue(value);
      }, 300), // 300ms delay
    []
  );

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageSearchValue(value);
    debouncedSetSearch(value);
  };

  // Use debouncedSearchValue for the API call
  const { data: searchResult = [] } = useSearchChatMessages({
    sessionId: chatId,
    search: debouncedSearchValue,
    onBeforeReturn: async resData => {
      const firstFound = resData.results[0];
      setActiveMessageSearchData(firstFound);
    },
  });

  const handleChatJump = async (
    chatId: string,
    chatMessage: ChatSearchResult
  ): Promise<ChatMessagesPage> => {
    const jumpPage = chatMessage.page;
    const limit = 20;

    const pageResponse = await axiosGet(`/chat/messages/${chatId}`, {
      params: { page: jumpPage, limit },
    });

    const pageData = pageResponse?.data?.data?.data ?? [];
    const total = pageResponse?.data?.data?.total ?? 0;

    const nextPage = jumpPage * limit < total ? jumpPage + 1 : undefined;
    const prevPage = jumpPage > 1 ? jumpPage - 1 : undefined;

    const newPage = { items: pageData, total, nextPage, prevPage };

    // set fresh data into infinite query cache
    await queryClient.setQueryData(chatQueryKeys.messages(chatId), {
      pages: [newPage],
      pageParams: [jumpPage],
    });
    setHighlightId(chatMessage.message.id);
    return newPage;
  };

  const handleFetchPrevious = async () => {
    try {
      const limit = 20;
      const result = (await fetchPreviousPage()) as { data: MessageType[] };
      const id = result.data[limit - 1]?.id;

      setTimeout(() => {
        const element = document.getElementById(`message-${id}`);
        if (!element) return;

        // Scroll to element with different positioning options
        element.scrollIntoView({
          behavior: 'instant',
          block: 'end',
        });
      }, 0);
    } catch (error) {
      console.error('Failed to fetch previous messages:', error);
    }
  };

  const handleActiveMessageSearchData = (data: ChatSearchResult | null) => {
    setActiveMessageSearchData(data);
  };

  const handleUpdateActiveChatSession = <K extends keyof ChatSession>(
    key: K,
    value: ChatSession[K]
  ) => {
    setActiveChat(prev => (prev ? { ...prev, [key]: value } : prev));
  };

  useEffect(() => {
    if (activeMessageSearchData) {
      handleChatJump(chatId, activeMessageSearchData);
    } else {
      setHighlightId('');
    }
  }, [activeMessageSearchData]);

  useEffect(() => {
    handleCloseSearch();
  }, [chatId]);

  // Early Return
  if (!activeChat) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-Primarygray'>Select a conversation to start chatting</p>
      </div>
    );
  }

  // Render
  return (
    <>
      <div className={`rounded-20px flex-1 flex flex-col bg-surfacelittlelight h-full`}>
        {/* Chat Header */}
        <ChatHeader
          chatId={chatId}
          activeChat={activeChat}
          handleCollapse={e => handleCollapse?.(e)}
          onActiveChatSessionUpdate={handleUpdateActiveChatSession}
          handleCloseSearch={handleCloseSearch}
          handleChangeSearch={handleChangeSearch}
          messageSearchValue={messageSearchValue}
          searchResult={searchResult}
          activeMessageSearchData={activeMessageSearchData}
          handleActiveMessageSearchData={handleActiveMessageSearchData}
        />

        {/* Messages Area */}
        <DualAxisInfiniteScroll
          containerRef={chatContainerRef}
          loading={isLoading}
          hasMoreTop={hasNextPage}
          triggerOnHasMoreTop={fetchNextPage}
          hasMoreBottom={hasPreviousPage}
          triggerOnHasMoreBottom={handleFetchPrevious}
          scrollToMessageId={highlightId}
          containerClassName='overflow-y-auto p-3.5  flex-1 flex flex-col-reverse'
        >
          {hasPreviousPage && (
            <div className='message-loading'>
              <Spinner size='w-10 h-10' color='text-primary' className='mx-auto my-4' />
            </div>
          )}

          {groupedMessages.length > 0
            ? groupedMessages.map(([dateKey, messages]) => (
                <React.Fragment key={dateKey}>
                  <div className='flex flex-col gap-4'>
                    {messages.map(message => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        userTimezone={user.timezone}
                        searchTerm={debouncedSearchValue}
                        isHighlighted={message.id === highlightId}
                      />
                    ))}
                  </div>

                  {/* Date Divider */}
                  <div className='flex justify-center my-4'>
                    <span className='bg-surface rounded-10px px-4 py-1.5 text-sm font-semibold'>
                      {formatDateLabel(dateKey, DATE_FORMATS.LONG)}
                    </span>
                  </div>
                </React.Fragment>
              ))
            : !isLoading &&
              activeChat.status !== 'Closed' && (
                <div className='flex flex-col items-center justify-center h-full text-center py-8'>
                  <div className='bg-surface rounded-10px px-6 py-4 max-w-sm'>
                    <p className='text-primarygray text-lg font-semibold'>No messages found</p>
                    <p className='text-primarygray text-base mt-1 opacity-75'>
                      Start a conversation to see messages here
                    </p>
                  </div>
                </div>
              )}

          {hasNextPage && (
            <div className='message-loading'>
              <Spinner size='w-10 h-10' color='text-primary' className='mx-auto my-4' />
            </div>
          )}
        </DualAxisInfiniteScroll>

        {/* Input Area */}
        {activeChat.status === 'Closed' ? (
          <SessionEndedMessage recipientName={activeChat.recipient.display_name} />
        ) : (
          <MessageInput
            messageText={messageText}
            selectedFiles={selectedFiles}
            fileError={fileError}
            onMessageChange={handleMessageChange}
            onFilesSelected={handleFilesSelected}
            onSend={handleSend}
            onAttachClick={handleAttachClick}
            fileInputRef={fileInputRef}
            removeFile={removeFile}
            isSendingMessage={isSendingMessage}
          />
        )}
      </div>
    </>
  );
};

export default ConversationView;
