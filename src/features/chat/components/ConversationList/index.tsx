import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';

import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import clsx from 'clsx';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { useInfiniteChatSessions, useMarkMessagesAsRead } from '@/api/chat';
import { chatQueryKeys } from '@/api/common/chat.queryKey';
import { UserRole } from '@/api/types/user.dto';
import { getUserDetails } from '@/api/user';
import ConversationItem from '@/features/chat/components/ConversationList/ConversationItem';
import StatusMenu from '@/features/chat/components/ConversationList/StatusMenu';
import type {
  ChatSession,
  ChatSessionsPage,
  MessageMarkedAsReadEventType,
  MessageType,
  PresenceUpdate,
} from '@/features/chat/types';
import { useSocketEmit, useSocketListener } from '@/hooks/socket';
import { usePopupClose } from '@/hooks/usePopupClose';
import { currentUser } from '@/redux/ducks/user';
import DualAxisInfiniteScroll from '@/stories/Common/DualAxisInfiniteScroll';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Spinner';

const SEARCH_DEBOUNCE_DELAY = 400;

// Main Component
const ConversationsList: React.FC<{
  handleCollapse?: (status: boolean) => void;
}> = ({ handleCollapse }) => {
  // Refs and Hooks
  const isFirstRender = useRef(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const { chatId = '' } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const emit = useSocketEmit();
  const user = useSelector(currentUser);
  const { mutate: markAsRead } = useMarkMessagesAsRead();

  getUserDetails({ isEnabled: true });

  // State
  const [searchText, setSearchText] = useState('');
  const [isUserOnline, setIsUserOnline] = useState(user.is_online);
  const { isOpen: isMenuVisible, setIsOpen: setMenuVisible } = usePopupClose({
    popupRef: menuRef as React.RefObject<HTMLElement>,
  });

  // API Calls
  const {
    data,
    refetch,
    hasNextPage,
    fetchNextPage,
    isLoading: isChatlistLoading,
  } = useInfiniteChatSessions({
    search: searchText,
  });

  // Memoize flatten for performance
  const conversations = useMemo(() => {
    return data?.pages.flatMap(page => page.items) ?? [];
  }, [data]);

  // Event Handlers
  const handleMenuClick = useCallback(
    (action: string) => {
      const isOnline = action === 'Online';
      emit('socket:update_status', isOnline);
      setIsUserOnline(isOnline);
      setMenuVisible(false);
    },
    [emit, setMenuVisible]
  );

  const handleSelectChat = useCallback(
    (chat: ChatSession): void => {
      if (chat.unread_count > 0) {
        markAsRead({ sessionId: chat.id });
      }
      navigate(`/chat/${chat.id}`);
    },
    [markAsRead, navigate]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchText(value);
      }, SEARCH_DEBOUNCE_DELAY),
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  const toggleMenuVisibility = useCallback(() => {
    setMenuVisible(prev => !prev);
  }, [setMenuVisible]);

  // Socket Listeners
  useSocketListener<PresenceUpdate>(
    'user:presence_update',
    useCallback(
      data => {
        queryClient.setQueryData(
          chatQueryKeys.sessions(),
          (oldData: InfiniteData<ChatSessionsPage> | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map(page => ({
                ...page,
                items: page.items.map((session: ChatSession) =>
                  session.recipient?.user_id === data.userId
                    ? {
                        ...session,
                        recipient: {
                          ...session.recipient,
                          is_online: data.isOnline,
                        },
                      }
                    : session
                ),
              })),
            };
          }
        );
      },
      [queryClient]
    )
  );

  useSocketListener<MessageType>(
    'newMessage',
    useCallback(
      data => {
        if (chatId !== data.chat_id) {
          refetch();
        }
      },
      [chatId, refetch]
    )
  );

  useSocketListener<MessageMarkedAsReadEventType>('messagesMarkedAsRead', data => {
    if (chatId !== data.sessionId) {
      refetch();
    }
  });

  // Effects
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    refetch();
  }, [searchText]);

  // Cleanup debounced search on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    setIsUserOnline(user.is_online);
  }, [user.is_online]);

  // Render
  return (
    <div className='lg:max-w-368px w-full p-5 rounded-20px bg-white flex flex-col h-full lg:h-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-3.5'>
        <h1 className='text-lg font-bold text-blackdark'>Message</h1>

        {user.role === UserRole.THERAPIST && (
          <div className='relative'>
            <Image
              onClick={toggleMenuVisibility}
              imgPath={user.profile_image || ''}
              firstName={user.first_name}
              lastName={user.last_name}
              alt='User Avatar'
              imageClassName='rounded-full'
              className='w-8 h-8 cursor-pointer'
              initialClassName='!text-base'
            />
            <div
              className={clsx(
                'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ',
                isUserOnline ? 'bg-Green' : 'bg-red'
              )}
            />
            <StatusMenu isVisible={isMenuVisible} onMenuClick={handleMenuClick} menuRef={menuRef} />
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className='relative mb-5'>
        <InputField
          type='search'
          placeholder='Search'
          onChange={handleSearchChange}
          iconClassName='icon-wrapper text-primarygray w-18px h-18px'
          icon='search'
          iconFirst
          inputClass='bg-Gray'
        />
      </div>

      {/* Conversations List */}
      <DualAxisInfiniteScroll
        hasMoreTop={hasNextPage}
        triggerOnHasMoreTop={fetchNextPage}
        loading={isChatlistLoading}
        containerClassName='flex flex-col pr-1 overflow-y-auto h-[calc(100%-93px)]'
      >
        {conversations.length === 0 ? (
          <div className='text-center text-xl text-blackdark mt-8'>
            <p>No conversations found</p>
          </div>
        ) : (
          conversations.map(conversation => (
            <React.Fragment key={conversation.id}>
              <ConversationItem
                conversation={conversation}
                handleCollapse={e => handleCollapse?.(e)}
                isActive={chatId === conversation.id}
                onSelect={handleSelectChat}
                userTimezone={user.timezone}
              />
            </React.Fragment>
          ))
        )}
        {hasNextPage && (
          <div className='flex justify-center my-4'>
            <Spinner size='w-7 h-7' color='text-red-600' />
          </div>
        )}
      </DualAxisInfiniteScroll>
    </div>
  );
};

export default ConversationsList;
