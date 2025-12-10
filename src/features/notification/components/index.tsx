import React, { useCallback, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useMarkMessagesAsRead } from '@/api/chat';
import { notificationQueryKeys } from '@/api/common/notification.query';
import {
  useMarkParticularNotificationAsRead,
  useMarkNotificationsAsRead,
  useInfiniteNotifications,
} from '@/api/notification';
import { UserRole } from '@/api/types/user.dto';
import { ROUTES } from '@/constants/routePath';
import {
  NotificationCategory,
  NotificationEvent,
  NotificationReadStatus,
  type NotificationItemType,
  type NotificationMetadataType,
} from '@/features/notification/types';
import { getRelativeTime } from '@/helper/dateUtils';
import { useSocketListener } from '@/hooks/socket';
import { usePopupClose } from '@/hooks/usePopupClose';
import { currentUser } from '@/redux/ducks/user';
import DualAxisInfiniteScroll from '@/stories/Common/DualAxisInfiniteScroll';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Spinner from '@/stories/Common/Spinner';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const Notification = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notificationRef = useRef<HTMLDivElement>(null);

  const user = useSelector(currentUser);

  const { mutate: markAllRead } = useMarkNotificationsAsRead();
  const { mutate: markChatAsRead } = useMarkMessagesAsRead();
  const { mutate: markParticularNotificationRead } = useMarkParticularNotificationAsRead();

  const [isViewAllActive, setIsViewAllActive] = useState(false);

  const { isOpen: isNotificationVisible, setIsOpen: setNotificationVisible } = usePopupClose({
    popupRef: notificationRef as React.RefObject<HTMLElement>,
  });

  const toggleNotification = () => setNotificationVisible(v => !v);

  const {
    data: { items: notificationList = [], totalUnread = 0 } = {},
    fetchNextPage,
    hasNextPage,
    isLoading: isNotificationLoading,
  } = useInfiniteNotifications({ limit: 10, status: isViewAllActive ? 'all' : 'unread' });

  const handleChatNavigation = (sessionId: string, notificationId: string) => {
    markChatAsRead({ sessionId });
    markParticularNotificationRead(notificationId);
    navigate(`/chat/${sessionId}`);
    setNotificationVisible(false);
  };

  const handleViewAllNotification = () => {
    setIsViewAllActive(!isViewAllActive);
  };

  const handleSlotRequestClick = (notification: NotificationItemType) => {
    markParticularNotificationRead(notification.id);
    navigate(`/calendar`);
    setNotificationVisible(false);
  };

  const handleJoinSession = (notification: NotificationItemType) => {
    markParticularNotificationRead(notification.id);
    window.open(`${notification.metadata.session_link}`, '_blank');
    setNotificationVisible(false);
  };

  useSocketListener(
    'notification:new',
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.list('unread'),
      });
    }, [])
  );

  const renderVisual = (noti: NotificationItemType) => {
    const visual = noti.metadata.visual;
    switch (visual?.type) {
      case 'profile':
        return (
          <div className='w-10 h-10 rounded-full overflow-hidden'>
            <Image
              imgPath={noti.sender.profile_image ? SERVER_URL + noti.sender.profile_image : ''}
              firstName={noti.sender.first_name}
              lastName={noti.sender.last_name}
              imageClassName='rounded-full object-cover'
              className='w-full h-full bg-surface'
              initialClassName='!text-base'
            />
          </div>
        );

      case 'icon':
        return <Icon name={visual.iconName || 'reminder'} className={visual.className} />;

      default:
        return null;
    }
  };

  const renderGenericNotification = (noti: NotificationItemType) => {
    const meta = noti.metadata;

    const handleClick = () => {
      if (!meta.clickable) return;
      markParticularNotificationRead(noti.id);
      handleGenericNavigation(meta);
      setNotificationVisible(false);
    };

    const handleGenericNavigation = (meta: NotificationMetadataType) => {
      if (!meta.navigateTo) return;
      if (meta.external) {
        window.open(`${meta.navigateTo}`, '_blank');
      } else {
        navigate(meta.navigateTo);
      }
    };

    return (
      <li
        key={noti.id}
        className={`flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3
        ${meta.clickable ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={handleClick}
      >
        <div className='flex items-start gap-4'>
          {/* RED DOT */}
          <div
            className={`relative ${
              noti.status === NotificationReadStatus.UNREAD
                ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                : ''
            }`}
          >
            {renderVisual(noti)}
          </div>

          <div className='flex flex-col gap-1 w-[calc(100%-56px)]'>
            {noti.title && (
              <h6 className='text-base font-bold text-blackdark leading-22px'>{noti.title}</h6>
            )}
            {noti.message && <p className='text-sm font-normal text-primarygray'>{noti.message}</p>}
          </div>
        </div>

        <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
          {getRelativeTime(noti.created_at)}
        </span>
      </li>
    );
  };

  // Render notification item based on type
  const renderNotificationItem = (notification: NotificationItemType) => {
    switch (notification.category) {
      case NotificationCategory.CHAT:
        return (
          <li
            onClick={() =>
              handleChatNavigation(notification.metadata.sessionId as string, notification.id)
            }
            key={notification.id}
            className='flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3 cursor-pointer'
          >
            <div className='flex items-start gap-4'>
              <div
                className={`relative ${
                  notification.status == NotificationReadStatus.UNREAD
                    ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                    : ''
                }`}
              >
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                  <Image
                    imgPath={
                      notification.sender.profile_image
                        ? `${SERVER_URL}${notification.sender.profile_image}`
                        : ''
                    }
                    firstName={notification.sender.first_name}
                    lastName={notification.sender.last_name}
                    alt='recipient Avatar'
                    imageClassName='rounded-full object-cover object-center w-full h-full'
                    className='w-full h-full bg-surface'
                    initialClassName='!text-base'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-1 w-[calc(100%-56px)]'>
                <h6 className='text-base font-bold text-blackdark leading-22px'>
                  New message from {notification.sender.display_name}
                </h6>
                <p
                  className='text-sm font-normal text-primarygray line-clamp-2 overflow-hidden text-ellipsis'
                  title={notification.message}
                >
                  {notification.message}
                </p>
              </div>
            </div>
            <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
              {getRelativeTime(notification.updated_at)}
            </span>
          </li>
        );

      case NotificationCategory.APPOINTMENT: {
        const isInitiator = user.id === notification.metadata.initiator_id;

        const getNotificationMessage = () => {
          const senderName = notification.sender.display_name;
          const dateTime = `${moment
            .tz(notification.metadata.start_time, user.timezone)
            .format('MMM DD, YYYY')} at ${moment
            .tz(notification.metadata.start_time, user.timezone)
            .format('h:mm A')}`;

          switch (notification.event) {
            case 'APPOINTMENT_BOOKED':
              return isInitiator
                ? `Your appointment with ${senderName} has been booked for ${dateTime}.`
                : `New appointment booked with ${senderName} on ${dateTime}.`;

            case 'APPOINTMENT_CANCELLED':
              if (user.role == UserRole.ADMIN) {
                return notification.message;
              }
              if (notification.metadata?.all_future) {
                return isInitiator
                  ? `All your future appointments with ${senderName} have been cancelled.`
                  : `All future appointments with ${senderName} have been cancelled.`;
              }
              return isInitiator
                ? `Your appointment with ${senderName} scheduled on ${dateTime} has been cancelled.`
                : `Appointment with ${senderName} scheduled on ${dateTime} has been cancelled.`;

            case 'APPOINTMENT_RESCHEDULED':
              return isInitiator
                ? `Your appointment with ${senderName} has been rescheduled to ${dateTime}.`
                : `Appointment with ${senderName} has been rescheduled to ${dateTime}.`;

            default:
              return '';
          }
        };

        const renderIcon = () => {
          if (isInitiator) {
            return <Icon name='tickcircle' className='w-10 h-10 icon-wrapper text-Green' />;
          }

          return (
            <div className='w-10 h-10 rounded-full overflow-hidden'>
              <Image
                imgPath={
                  notification.sender.profile_image
                    ? `${SERVER_URL}${notification.sender.profile_image}`
                    : ''
                }
                firstName={notification.sender.first_name}
                lastName={notification.sender.last_name}
                alt='recipient Avatar'
                imageClassName='rounded-full object-cover object-center w-full h-full'
                className='w-full h-full bg-surface'
                initialClassName='!text-base'
              />
            </div>
          );
        };

        const liClassName =
          'flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3';

        const textClassName = isInitiator
          ? 'text-sm font-normal text-blackdark w-[calc(100%-56px)]'
          : 'text-sm font-normal text-primarygray w-[calc(100%-56px)]';

        return (
          <li key={notification.id} className={liClassName}>
            <div className='flex items-start gap-4'>
              <div
                className={`relative ${
                  notification.status == NotificationReadStatus.UNREAD
                    ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                    : ''
                }`}
              >
                {renderIcon()}
              </div>
              <p className={textClassName}>{getNotificationMessage()}</p>
            </div>
            <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
              {getRelativeTime(notification.created_at)}
            </span>
          </li>
        );
      }

      case NotificationCategory.SLOT_REQUEST:
        return (
          <li
            key={notification.id}
            className='flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3 cursor-pointer'
            onClick={() => handleSlotRequestClick(notification)}
          >
            <div className='flex items-start gap-4'>
              <div
                className={`relative ${
                  notification.status == NotificationReadStatus.UNREAD
                    ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                    : ''
                }`}
              >
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                  <Image
                    imgPath={
                      notification.sender.profile_image
                        ? `${SERVER_URL}${notification.sender.profile_image}`
                        : ''
                    }
                    firstName={notification.sender.first_name}
                    lastName={notification.sender.last_name}
                    alt='client Avatar'
                    imageClassName='rounded-full object-cover object-center w-full h-full'
                    className='w-full h-full bg-surface'
                    initialClassName='!text-base'
                  />
                </div>
              </div>
              <p className='text-sm font-normal text-primarygray w-[calc(100%-56px)]'>
                {`New slot request from ${notification.sender.display_name} for ${moment.tz(notification.metadata.preferred_time, user.timezone).format('MMM DD, YYYY')} at ${moment.tz(notification.metadata.preferred_time, user.timezone).format('h:mm A')}.`}
              </p>
            </div>
            <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
              {getRelativeTime(notification.created_at)}
            </span>
          </li>
        );

      case NotificationCategory.SESSION_REMINDER:
        return (
          <li
            onClick={() => handleJoinSession(notification)}
            key={notification.id}
            className='cursor-pointer flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3'
          >
            <div className='flex items-start gap-4'>
              <div
                className={`relative ${
                  notification.status == NotificationReadStatus.UNREAD
                    ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                    : ''
                }`}
              >
                <Icon name='reminder' className='text-red' />
              </div>
              <div className='flex flex-col gap-1 w-[calc(100%-56px)]'>
                <h6 className='text-base font-bold text-blackdark leading-22px'>
                  Reminder Appointment
                </h6>
                <p className='text-sm font-normal text-primarygray'>
                  {`Your session with ${notification.sender.display_name} starts at ${moment.tz(notification.metadata.start_time, user.timezone).format('h:mm A')}. Click here to join.`}
                </p>
              </div>
            </div>
            <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
              {getRelativeTime(notification.created_at)}
            </span>
          </li>
        );

      case NotificationCategory.SYSTEM:
        if (
          notification.event === NotificationEvent.NEW_CLIENT_JOINED ||
          notification.event === NotificationEvent.NEW_THERAPIST_JOINED
        ) {
          return (
            <li
              key={notification.id}
              className='flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3 cursor-pointer'
            >
              <div className='flex items-start gap-4'>
                <div
                  className={`relative ${
                    notification.status === NotificationReadStatus.UNREAD
                      ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                      : ''
                  }`}
                >
                  <div className='w-10 h-10 rounded-full overflow-hidden'>
                    <Image
                      imgPath={
                        notification.sender.profile_image
                          ? `${SERVER_URL}${notification.sender.profile_image}`
                          : ''
                      }
                      firstName={notification.sender.first_name}
                      lastName={notification.sender.last_name}
                      alt='sender Avatar'
                      imageClassName='rounded-full object-cover object-center w-full h-full'
                      className='w-full h-full bg-surface'
                      initialClassName='!text-base'
                    />
                  </div>
                </div>
                <div className='flex flex-col gap-1 w-[calc(100%-56px)]'>
                  <h6 className='text-base font-bold text-blackdark leading-22px'>
                    {notification.title || 'System Notification'}
                  </h6>
                  <p className='text-sm font-normal text-primarygray' title={notification.message}>
                    {notification.message}
                  </p>
                </div>
              </div>
              <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
                {getRelativeTime(notification.created_at)}
              </span>
            </li>
          );
        }

        if (notification.event === NotificationEvent.APPOINTMENT_NO_SHOW) {
          return (
            <li
              key={notification.id}
              className='cursor-pointer flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3'
            >
              <div className='flex items-start gap-4'>
                <div
                  className={`relative ${
                    notification.status == NotificationReadStatus.UNREAD
                      ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                      : ''
                  }`}
                >
                  <Icon name='alertTriangle' className='text-red pt-1' />
                </div>
                <div className='flex flex-col gap-1 w-[calc(100%-56px)]'>
                  <h6 className='text-base font-bold text-blackdark leading-22px'>
                    {notification.title}
                  </h6>
                  <p className='text-sm font-normal text-primarygray'>{notification.message}</p>
                </div>
              </div>
              <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
                {getRelativeTime(notification.created_at)}
              </span>
            </li>
          );
        }
        return null;

      case NotificationCategory.INSURANCE:
        return (
          <li
            key={notification.id}
            className='flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3 cursor-pointer'
          >
            <div className='flex items-start gap-4'>
              <div
                className={`relative ${
                  notification.status === NotificationReadStatus.UNREAD
                    ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                    : ''
                }`}
              >
                <Icon name='alertTriangle' className='text-red pt-1 w-6 h-6' />
              </div>

              <div className='flex flex-col gap-1 w-[calc(100%-56px)]'>
                <h6 className='text-base font-bold text-blackdark leading-22px'>
                  {notification.title || 'Insurance Verification Failed'}
                </h6>

                <p className='text-sm font-normal text-primarygray' title={notification.message}>
                  {notification.message}
                </p>
              </div>
            </div>

            <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
              {getRelativeTime(notification.created_at)}
            </span>
          </li>
        );

      case NotificationCategory.BACKOFFICE_QUEUE:
        return (
          <li
            key={notification.id}
            className='flex items-start justify-between gap-4 pb-4 mb-4 border-b border-solid border-surface md:pl-5 pl-3 cursor-pointer'
            onClick={() => {
              markParticularNotificationRead(notification.id);
              // Navigate to the backoffice queue detail page
              navigate(
                ROUTES.QUEUE_DETAILS_VIEW.navigatePath(notification.metadata.queue_id as string)
              );
              setNotificationVisible(false);
            }}
          >
            <div className='flex items-start gap-4'>
              <div
                className={`relative ${
                  notification.status === NotificationReadStatus.UNREAD
                    ? 'before:absolute md:before:-left-5 before:-left-3 before:top-2/4 before:-translate-y-2/4 before:bg-primary before:w-1.5 before:h-1.5 before:rounded-full'
                    : ''
                }`}
              >
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                  <Image
                    imgPath={
                      notification.sender.profile_image
                        ? `${SERVER_URL}${notification.sender.profile_image}`
                        : ''
                    }
                    firstName={notification.sender.first_name}
                    lastName={notification.sender.last_name}
                    alt='sender Avatar'
                    imageClassName='rounded-full object-cover object-center w-full h-full'
                    className='w-full h-full bg-surface'
                    initialClassName='!text-base'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-1 w-[calc(100%-56px)]'>
                <h6 className='text-base font-bold text-blackdark leading-22px'>
                  {notification.title || 'New Ticket Assigned'}
                </h6>
                <p className='text-sm font-normal text-primarygray' title={notification.message}>
                  {notification.message}
                </p>
              </div>
            </div>

            <span className='whitespace-nowrap text-xs font-normal text-blackdark'>
              {getRelativeTime(notification.created_at)}
            </span>
          </li>
        );

      default:
        return renderGenericNotification(notification);
    }
  };

  return (
    <div className='relative'>
      <div
        className='cursor-pointer border border-surface rounded-10px w-10 h-10 flex items-center justify-center'
        onClick={toggleNotification}
      >
        <Icon name='notification' className='text-blackdark icon-wrapper w-5 h-5' />
        {totalUnread > 0 && (
          <span className='absolute -top-1.5 -right-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5'>
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </div>
      {isNotificationVisible && (
        <div
          ref={notificationRef}
          className='absolute sm:-right-4 z-50  mt-2 bg-white rounded-20px  shadow-dropdown border border-solid border-surface md:w-423px sm:w-[350px] w-[270px]'
        >
          <div className='p-5 pb-3 flex flex-wrap gap-2 items-center justify-between border-b border-surface'>
            <h5 className='text-base font-bold text-blackdark'>Notifications</h5>
            <div className='flex items-center gap-2.5 ml-auto'>
              <h5
                onClick={handleViewAllNotification}
                className={`text-sm font-bold cursor-pointer px-3 py-1 rounded-lg transition-all duration-200 
                                        ${
                                          isViewAllActive
                                            ? 'bg-primary text-white shadow-md scale-105'
                                            : 'text-primary hover:bg-primary/10'
                                        }`}
              >
                View All Notifications
              </h5>
              <div className='h-3.5 w-1px bg-primarylight'></div>
              <span
                onClick={() => markAllRead()}
                className='text-sm font-normal text-red cursor-pointer'
              >
                Clear All
              </span>
            </div>
          </div>
          {notificationList.length > 0 ? (
            <DualAxisInfiniteScroll
              containerElement={'ul'}
              hasMoreTop={hasNextPage}
              triggerOnHasMoreTop={fetchNextPage}
              loading={isNotificationLoading}
              containerClassName='md:p-5 py-5 px-2 max-h-100 overflow-y-auto'
            >
              {notificationList.map(notification => renderNotificationItem(notification))}
              {hasNextPage && (
                <Spinner size='w-10 h-10' color='text-red-600' className='mx-auto my-4' />
              )}
            </DualAxisInfiniteScroll>
          ) : (
            <li className='text-center py-8 text-sm text-primarygray list-none'>
              No notifications found
            </li>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
