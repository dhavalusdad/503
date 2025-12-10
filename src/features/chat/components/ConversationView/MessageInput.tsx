import React, { useCallback, useEffect, useRef } from 'react';

import clsx from 'clsx';

import { allowedMessageFileTypes } from '@/constants/CommonConstant';
import type { MessageInputProps } from '@/features/chat/types';
import { isImageFile } from '@/features/chat/Utilities';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import TextArea from '@/stories/Common/Textarea';

const MessageInput: React.FC<MessageInputProps> = React.memo(
  ({
    messageText,
    selectedFiles,
    fileError,
    onMessageChange,
    onFilesSelected,
    onSend,
    onAttachClick,
    fileInputRef,
    removeFile,
    isSendingMessage,
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (isSendingMessage) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onSend();
        }
      },
      [onSend, isSendingMessage]
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];

        // Extract files from clipboard
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            const file = item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
        }

        if (files.length > 0) {
          // Prevent default paste behavior when files are detected
          e.preventDefault();

          // Create a synthetic event to pass to the existing handler
          const syntheticEvent = {
            target: {
              files: files,
              value: '',
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          onFilesSelected(syntheticEvent);
        }
      },
      [onFilesSelected]
    );

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [messageText]);

    return (
      <div className='flex items-end justify-between gap-5 w-full my-3.5 px-3.5'>
        <div
          className={clsx(
            'relative w-full',
            selectedFiles.length > 0 ? 'border border-surface py-3 px-3.5 bg-Gray rounded-10px' : ''
          )}
        >
          {selectedFiles.length > 0 && (
            <div className='flex gap-2 mb-3'>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className='w-16 h-16 relative bg-surface p-2 rounded-lg flex items-center justify-center aspect-square'
                >
                  {isImageFile(file.name) ? (
                    <Image
                      imgPath={URL.createObjectURL(file)}
                      alt={file.name}
                      className='w-full h-full rounded-lg'
                      imageClassName='w-full h-full object-cover rounded-lg'
                    />
                  ) : (
                    <span className='truncate text-center text-sm px-2'>{file.name}</span>
                  )}

                  {/* Remove Button in Top-Right Corner */}
                  <Button
                    variant='filled'
                    icon={<Icon name='close' className='icon-wrapper w-3 h-3' />}
                    onClick={() => removeFile(idx)}
                    parentClassName='!absolute -top-1 -right-1'
                    className='rounded-full !p-0.5'
                  />
                </div>
              ))}
            </div>
          )}
          <div className='relative'>
            <TextArea
              placeholder='Type your message'
              value={messageText}
              onChange={e => {
                onMessageChange(e.target.value);
              }}
              onPaste={handlePaste}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              className='!text-base !leading-5 bg-Gray align-middle resize-none max-h-24 scroll-disable'
              rows={1}
            />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'>
              <div className='relative'>
                <Icon onClick={onAttachClick} name='attachFile' className='icon-wrapper w-5 h-5' />
                <InputField
                  inputRef={fileInputRef}
                  type='file'
                  multiple
                  inputClass='hidden'
                  onChange={onFilesSelected}
                  accept={allowedMessageFileTypes.join(',')}
                />
              </div>
            </div>
          </div>
          {/* Error Message */}
          {fileError && <p className='text-red-500 text-sm mt-2'>{fileError}</p>}
        </div>

        <Button
          onClick={onSend}
          variant='filled'
          isDisabled={(!messageText.trim() && selectedFiles.length === 0) || isSendingMessage}
          icon={<Icon name='chatSend' className='icon-wrapper w-18px h-18px' />}
          isIconFirst={true}
          title='Send'
          titleClassName='font-bold'
          className='rounded-10px min-h-50px'
          parentClassName={clsx('', fileError ? 'mb-10' : selectedFiles.length > 0 ? 'mb-3' : '')}
        />
      </div>
    );
  }
);

export default MessageInput;
