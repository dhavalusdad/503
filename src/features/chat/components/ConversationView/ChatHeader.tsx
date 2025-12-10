import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { useClearChatMessages, useMuteChatSession } from '@/api/chat';
import { ROUTES } from '@/constants/routePath';
import { getProfileImage } from '@/features/admin/components/appointmentList/components/AppointmentView';
import type { ChatHeaderProps, MenuItem } from '@/features/chat/types';
import { usePopupClose } from '@/hooks/usePopupClose';
import { AlertModal } from '@/stories/Common/AlertModal';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';

const ChatHeader: React.FC<ChatHeaderProps> = React.memo(
  ({
    handleCloseSearch,
    handleChangeSearch,
    messageSearchValue,
    searchResult,
    activeMessageSearchData,
    handleActiveMessageSearchData,

    activeChat,
    onActiveChatSessionUpdate,
    handleCollapse,
    chatId,
  }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { mutate: muteSession } = useMuteChatSession();

    const { isOpen: isMenuVisible, setIsOpen: setMenuVisible } = usePopupClose({
      popupRef: menuRef as React.RefObject<HTMLElement>,
    });

    //states
    const [isClearMessagePopupVisible, setIsClearMessagePopupVisible] = useState<boolean>(false);
    const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

    const { mutate: clearMessages } = useClearChatMessages({
      onSuccess: () => {
        setIsClearMessagePopupVisible(false);
      },
    });

    const MENU_ITEMS: MenuItem[] = [
      { id: 'search', label: 'Search', icon: 'search', action: 'Search' },
      { id: 'clear', label: 'Clear Message', icon: 'clearMessage', action: 'Clear Message' },
      !activeChat.is_mute
        ? {
            id: 'mute_notification',
            label: 'Mute Notification',
            icon: 'mute',
            action: 'Mute Notification',
          }
        : {
            id: 'unmute_notification',
            label: 'Unmute Notification',
            icon: 'notification',
            action: 'Unmute Notification',
          },
    ];

    // Set first result active when searchResult changes
    useEffect(() => {
      if (searchResult?.length > 0) {
        handleActiveMessageSearchData(searchResult[0]);
      } else {
        handleActiveMessageSearchData(null);
      }
    }, [searchResult]);

    // Derive current index from activeMessageSearchData
    const currentIndex = searchResult.findIndex(
      item => item.message.id === activeMessageSearchData?.message?.id
    );

    const handleDown = () => {
      if (currentIndex > 0) {
        handleActiveMessageSearchData(searchResult[currentIndex - 1]);
      }
    };

    const handleUp = () => {
      if (currentIndex < searchResult.length - 1) {
        handleActiveMessageSearchData(searchResult[currentIndex + 1]);
      }
    };

    const isDownDisabled = !searchResult?.length || currentIndex <= 0;
    const isUpDisabled = !searchResult?.length || currentIndex >= searchResult?.length - 1;

    const handleMenuClick = (action: string) => {
      switch (action) {
        case 'Clear Message':
          setIsClearMessagePopupVisible(true);
          break;

        case 'Mute Notification':
          muteSession({ sessionId: chatId, action: 'mute' });
          onActiveChatSessionUpdate('is_mute', true);
          break;

        case 'Unmute Notification':
          muteSession({ sessionId: chatId, action: 'unmute' });
          onActiveChatSessionUpdate('is_mute', false);
          break;

        case 'Search':
          setIsSearchActive(true);
          break;

        default:
          break;
      }
      setMenuVisible(false);
    };

    useEffect(() => {
      setIsSearchActive(false);
    }, [chatId]);

    return (
      <>
        <div className='flex items-center justify-between p-3.5 rounded-t-20px border-b border-solid border-surface bg-white relative'>
          {/* ---- User Info ---- */}
          <div className='flex items-center gap-2.5'>
            <div className='lg:hidden flex'>
              <Button
                variant='none'
                className='!p-0 mr-2'
                parentClassName='flex'
                onClick={() => {
                  navigate(ROUTES.CHAT.path);
                  handleCollapse(false);
                }}
              >
                <Icon name='arrowLeft' width={20} />
              </Button>
            </div>

            <div className='relative'>
              <Image
                imgPath={getProfileImage(activeChat.recipient.profile_image as string)}
                firstName={activeChat.recipient.first_name}
                lastName={activeChat.recipient.last_name}
                alt='User Avatar'
                imageClassName='rounded-full h-full w-full object-cover object-center'
                className='w-10 h-10 rounded-full'
                initialClassName='!text-lg'
              />
              <div
                className={clsx(
                  'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ',
                  activeChat.recipient.is_online ? 'bg-Green' : 'bg-red'
                )}
              />
            </div>

            <div className='flex flex-col gap-1'>
              <h2 className='font-semibold text-base text-blackdark'>
                {activeChat.recipient.display_name}
              </h2>
              <p className='text-sm font-normal text-primarygray'>
                {activeChat.recipient.is_online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* ---- Menu Button ---- */}
          <div className='relative'>
            <Button
              onClick={() => setMenuVisible(v => !v)}
              variant='none'
              icon={<Icon name='threedots' className='icon-wrapper w-18px h-18px' />}
              className={clsx(
                '!p-0 w-10 h-10 border border-primarygray rounded-full hover:bg-primary hover:text-white',
                isMenuVisible ? 'bg-primary text-white' : ''
              )}
            />
            {isMenuVisible && (
              <div
                ref={menuRef}
                className='absolute z-50 right-0 mt-2 bg-white rounded-10px shadow-surfaceshadow border border-solid border-surface min-w-48'
              >
                <ul>
                  {MENU_ITEMS.map(item => (
                    <li
                      key={item.id}
                      className='flex items-center gap-2 py-2.5 px-3.5 cursor-pointer hover:bg-surface'
                      onClick={() => handleMenuClick(item.action)}
                    >
                      <Icon name={item.icon} className='icon-wrapper w-4 h-4 text-primarygray' />
                      <span className='text-base font-normal text-blackdark whitespace-nowrap'>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ---- Search Box with Navigation ---- */}
          {isSearchActive && (
            <div className='absolute w-full xl:w-4/5 2xl:w-70% top-full mt-5 xl:left-2/4 xl:-translate-x-2/4  z-50'>
              <div className='relative'>
                <InputField
                  type='text'
                  value={messageSearchValue}
                  onChange={handleChangeSearch}
                  placeholder='Search'
                  inputClass='!bg-surface'
                  icon='search'
                  iconFirst
                />

                <div className='absolute left-3 top-1/2 -translate-y-1/2 text-primary cursor-pointer'>
                  <Icon name='search' className='icon-wrapper w-18px h-18px' />
                </div>

                {searchResult?.length === 0 && messageSearchValue && (
                  <div className='absolute right-27 top-1/2 -translate-y-1/2 text-center text-base text-primarygray pointer-events-none'>
                    No results found
                  </div>
                )}

                <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1'>
                  {/* Up Arrow */}
                  <Button
                    variant='none'
                    isDisabled={isUpDisabled}
                    onClick={handleUp}
                    className={`!p-1 rounded transition-colors text-primarygraydark`}
                    icon={<Icon name='chevronLeft' className='icon-wrapper w-4 h-4 rotate-90' />}
                  />

                  {/* Down Arrow */}
                  <Button
                    variant='none'
                    isDisabled={isDownDisabled}
                    onClick={handleDown}
                    className={`!p-1 rounded transition-colors text-primarygraydark`}
                    icon={<Icon name='chevronRight' className='icon-wrapper w-4 h-4 rotate-90' />}
                  />

                  {/* Close */}
                  <Button
                    variant='none'
                    onClick={() => {
                      setIsSearchActive(false);
                      handleCloseSearch();
                    }}
                    className='!p-1 text-primarygraydark'
                    icon={<Icon name='close' className='icon-wrapper w-18px h-18px' />}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertModal
          isOpen={isClearMessagePopupVisible}
          onClose={() => setIsClearMessagePopupVisible(false)}
          onSubmit={() => clearMessages({ sessionId: chatId })}
          alertMessage='Are you sure you want to clear the messages?'
          title='Confirm Clear Message'
        />
      </>
    );
  }
);

export default ChatHeader;
