import React, { useCallback, useMemo, useState, useEffect } from 'react';

import clsx from 'clsx';
import moment from 'moment';

import { getFileFromUrl } from '@/features/admin/components/appointmentList/components/AppointmentView';
import type { MessageBubbleProps } from '@/features/chat/types';
import { isImageFile } from '@/features/chat/Utilities';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Modal from '@/stories/Common/Modal';

const highlightText = (text: string, search: string): React.ReactNode => {
  if (!search.trim()) return text;

  const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className='bg-yellow-300 text-blackdark px-0.5 rounded'>
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const linkifyText = (
  text: string,
  searchTerm?: string,
  isHighlighted: boolean = false
): React.ReactNode[] => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];
  const result: React.ReactNode[] = [];

  parts.forEach((part, i) => {
    result.push(isHighlighted && searchTerm ? highlightText(part, searchTerm) : part);

    if (matches[i]) {
      result.push(
        <a
          key={i}
          href={matches[i]}
          target='_blank'
          rel='noopener noreferrer'
          className='hover:underline break-words'
        >
          {isHighlighted && searchTerm ? highlightText(matches[i], searchTerm) : matches[i]}
        </a>
      );
    }
  });

  return result;
};

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ message, userTimezone, isHighlighted = false, searchTerm = '' }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const isFile = message.message_type === 'File';
    const fileUrls = message.file_urls || [];

    const imageFiles = useMemo(() => fileUrls.filter(isImageFile), [fileUrls]);
    const documentFiles = useMemo(() => fileUrls.filter(url => !isImageFile(url)), [fileUrls]);

    const formatTime = useCallback(
      (timestamp: string) => {
        return moment(timestamp).tz(userTimezone).format('hh:mm A');
      },
      [userTimezone]
    );

    const handleImageClick = useCallback(
      (imageUrl: string) => {
        const imageIndex = imageFiles.findIndex(url => url === imageUrl);
        setCurrentImageIndex(imageIndex >= 0 ? imageIndex : 0);
        setIsPreviewOpen(true);
      },
      [imageFiles]
    );

    const handleClosePreview = useCallback(() => {
      setIsPreviewOpen(false);
      setCurrentImageIndex(0);
    }, []);

    const handleNextImage = useCallback(() => {
      setCurrentImageIndex(prev => (prev + 1) % imageFiles.length);
    }, [imageFiles.length]);

    const handlePrevImage = useCallback(() => {
      setCurrentImageIndex(prev => (prev - 1 + imageFiles.length) % imageFiles.length);
    }, [imageFiles.length]);

    // Keyboard navigation
    useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (!isPreviewOpen) return;

        if (event.key === 'ArrowRight') {
          handleNextImage();
        } else if (event.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (event.key === 'Escape') {
          handleClosePreview();
        }
      };

      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isPreviewOpen, handleNextImage, handlePrevImage, handleClosePreview]);

    const renderDeliveryStatus = () => {
      if (!message.is_own) return null;

      return (
        <div className='relative'>
          {message.delivery_status === 'Sent' && <Icon name='singleTick' width={17} height={17} />}
          {message.delivery_status === 'Read' && <Icon name='doubleTick' width={17} height={17} />}
        </div>
      );
    };

    const renderFileContent = () => {
      if (!isFile) return null;

      // Combine all files for unified grid
      const allFiles = [
        ...imageFiles.map(url => ({ url, type: 'image' })),
        ...documentFiles.map(url => ({ url, type: 'document' })),
      ];

      if (allFiles.length === 0) return null;

      return (
        <div className=''>
          <div
            className={clsx(
              'grid gap-4 ',
              allFiles.length === 1
                ? 'grid-cols-1'
                : allFiles.length === 2
                  ? 'grid-cols-2'
                  : allFiles.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-4'
            )}
          >
            {allFiles.map((file, idx) => (
              <div key={idx} className='max-h-60 max-w-full overflow-hidden rounded-lg'>
                {file.type === 'image' ? (
                  <Image
                    imgPath={getFileFromUrl(file.url)}
                    alt='Uploaded'
                    className=' cursor-pointer w-full h-full'
                    imageClassName='object-contain w-full h-full hover:opacity-90 transition-opacity'
                    onClick={() => handleImageClick(file.url)}
                  />
                ) : (
                  <div className='h-full w-full max-w-48 bg-surface flex flex-col gap-4 items-center justify-center p-4 group transition-colors cursor-pointer'>
                    <div className='relative'>
                      <span className='text-4xl'>{'📄'}</span>
                    </div>
                    <div className='text-center w-full flex flex-col gap-2'>
                      <p className='text-sm font-semibold text-blackdark truncate w-full'>
                        {file.url.split('/').pop()}
                      </p>
                      <a
                        href={getFileFromUrl(file.url)}
                        download
                        className='text-sm text-primary font-bold hover:underline'
                        onClick={e => e.stopPropagation()}
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const getCurrentImageUrl = () => {
      return imageFiles[currentImageIndex] || '';
    };

    const getCurrentFileName = () => {
      const currentUrl = getCurrentImageUrl();
      return currentUrl ? currentUrl.split('/').pop() || 'image' : '';
    };

    return (
      <>
        <div
          id={`message-${message.id}`}
          className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
        >
          <div className='flex flex-col gap-1.5 items-end'>
            <div
              className={`
                w-full p-3.5 rounded-2xl text-base font-normal leading-22px
                ${
                  message.is_own
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-surface text-blackdark rounded-tl-none'
                }
              `}
            >
              <div className='flex flex-col gap-2.5 items-end max-w-910px w-full'>
                {/* File Content */}
                {renderFileContent()}

                {/* Text Content */}
                {
                  <p className=' whitespace-pre-wrap break-all'>
                    {linkifyText(message.content || '', searchTerm, isHighlighted)}
                  </p>
                }
              </div>
              {/* Timestamp */}
              <div
                className={`
                flex items-center justify-end mt-1
                ${message.is_own ? 'text-white' : 'text-blackdark'}
              `}
              >
                <span className='text-xs font-normal'>{formatTime(message.created_at)}</span>
              </div>
            </div>

            {/* Delivery Status */}
            {renderDeliveryStatus()}
          </div>
        </div>

        {/* Image Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          size='2xl'
          title='Image Preview'
          contentClassName='pt-30px'
          className='overflow-hidden'
        >
          {getCurrentImageUrl() && (
            <>
              {/* Main image container */}
              <div className='relative flex items-center justify-center w-full h-full'>
                {/* Previous button */}
                {imageFiles.length > 1 && currentImageIndex > 0 && (
                  <Button
                    variant='filled'
                    onClick={handlePrevImage}
                    parentClassName='!absolute left-4 z-10'
                    className='rounded-full'
                    aria-label='Previous image'
                    icon={<Icon name='chevronLeft' className='icon-wrapper w-6 h-6' />}
                  />
                )}
                {/* Image */}
                <Image
                  imgPath={getFileFromUrl(getCurrentImageUrl())}
                  alt={getCurrentFileName()}
                  className='max-w-full h-full '
                  imageClassName='w-full h-full max-h-[calc(100dvh-200px)] object-contain object-center'
                />
                {/* Next button */}
                {imageFiles.length > 1 && currentImageIndex < imageFiles.length - 1 && (
                  <Button
                    variant='filled'
                    onClick={handleNextImage}
                    parentClassName='!absolute right-4 z-10'
                    className='rounded-full'
                    aria-label='Next image'
                    icon={<Icon name='chevronRight' className='icon-wrapper w-6 h-6' />}
                  />
                )}
              </div>
            </>
          )}
        </Modal>
      </>
    );
  }
);

export default MessageBubble;
