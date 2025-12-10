import React, { useCallback } from 'react';

import clsx from 'clsx';
import moment from 'moment';

import { getProfileImage } from '@/features/admin/components/appointmentList/components/AppointmentView';
import type { ConversationItemProps } from '@/features/chat/types';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';

const ConversationItem: React.FC<ConversationItemProps> = React.memo(
  ({ conversation, isActive, onSelect, userTimezone, handleCollapse }) => {
    const handleClick = useCallback(() => {
      onSelect(conversation);
      handleCollapse(true);
    }, [conversation, onSelect]);

    const formatTime = (timestamp: string) => {
      return moment(timestamp).tz(userTimezone).format('hh:mm A');
    };

    const renderMessageStatus = () => {
      if (!conversation.last_message?.is_own) return null;

      const status = conversation.last_message.delivery_status;
      if (status === 'Sent') {
        return <Icon name='singleTick' className='icon-wrapper w-5 h-5' />;
      }
      if (status === 'Read') {
        return <Icon name='doubleTick' className='icon-wrapper w-5 h-5' />;
      }
      return null;
    };

    return (
      <div
        onClick={handleClick}
        className={clsx(
          ' border-b border-solid border-surface pb-1.5 mb-1.5 last:mb-0 last:pb-0 last:border-b-0'
        )}
      >
        <div
          className={clsx(
            'p-3 hover:bg-Gray rounded-10px cursor-pointer flex items-center gap-2.5 w-full',
            isActive ? 'bg-surface' : ''
          )}
        >
          {/* Profile Image with Online Status */}
          <div className='relative'>
            <Image
              imgPath={getProfileImage(conversation.recipient.profile_image as string)}
              firstName={conversation.recipient.first_name}
              lastName={conversation.recipient.last_name}
              alt='User Avatar'
              imageClassName='rounded-full w-full h-full object-cover object-center'
              className='w-50px h-50px rounded-full border-2 border-solid border-white'
              initialClassName='!text-lg'
            />
            <div
              className={clsx(
                'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ',
                conversation.recipient.is_online ? 'bg-Green' : 'bg-red'
              )}
            />
          </div>

          {/* Conversation Details */}
          <div className='relative w-[calc(100%-60px)] flex flex-col gap-1'>
            {/* Header: Name and Time */}
            <div className='flex items-center justify-between w-full'>
              <h3
                className={clsx(
                  'text-base font-semibold truncate',
                  conversation.unread_count > 0 ? 'text-Green' : 'text-blackdark'
                )}
              >
                {conversation.recipient.display_name}
              </h3>
              <span className='text-xs font-normal text-primarygray whitespace-nowrap'>
                {conversation.last_message?.created_at
                  ? formatTime(conversation.last_message.created_at)
                  : ''}
              </span>
            </div>

            {/* Footer: Message Preview and Unread Count */}
            <div className='flex items-center justify-between w-full'>
              <p className='text-sm font-normal text-primarygray truncate flex items-center gap-1.5 w-full'>
                {renderMessageStatus()}
                <span className='block truncate w-[calc(100%-35px)]'>
                  {conversation.last_message?.message_type === 'File'
                    ? 'Sent a File'
                    : conversation.last_message?.content || ''}
                </span>
              </p>
              {conversation.unread_count > 0 && (
                <div className='bg-Green text-white font-bold text-xs rounded-full min-w-18px min-h-18px flex items-center justify-center'>
                  {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ConversationItem;
