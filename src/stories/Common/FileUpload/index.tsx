import React, { useEffect, useState } from 'react';

import clsx from 'clsx';

import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import { InputField } from '@/stories/Common/Input';

export interface FileItem {
  id: string;
  file?: File;
  name: string;
  url?: string;
  type: string;
  isExisting?: boolean;
  size?: number;
}

interface FileUploadProps {
  multiple?: boolean;
  handelSubmit: (files: FileItem[]) => void;
  accept?: string;
  NumberOfFileAllowed: number;
  noLimit?: boolean;
  className?: string;
  existingFiles?: FileItem[]; // Already uploaded files
  onFileRemove?: (fileId?: string) => void; // Callback for removing existing files
  isSubmitting?: boolean;
  autoUpload?: boolean;
  onFileClick?: (file: FileItem) => void;
  canRemoveExisting?: boolean;
  disabled?: boolean;
  parentClassName?: string;
  label?: string;
  labelNote?: string;
  labelClassName?: string;
  labelNoteClassName?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  multiple = true,
  handelSubmit,
  accept = '*/*',
  className,
  NumberOfFileAllowed = 2,
  noLimit = true,
  existingFiles = [],
  onFileRemove,
  isSubmitting = false,
  autoUpload = false,
  onFileClick,
  canRemoveExisting = false,
  disabled = false,
  parentClassName,
  label,
  labelNote,
  labelClassName,
  labelNoteClassName,
}) => {
  const fileICON = {
    PDF: <Icon name='fileNote' className='icon-wrapper w-12 h-12 text-red-500 opacity-50' />,
    DOC: <Icon name='fileNote' className='icon-wrapper w-12 h-12 text-blue-500 opacity-50' />,
  };

  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string>('');

  // Initialize with existing files
  useEffect(() => {
    if (existingFiles.length > 0) {
      setSelectedFiles(existingFiles);
    }
  }, [existingFiles]);

  const totalFiles = selectedFiles.length;
  const newFiles = selectedFiles.filter(f => !f.isExisting);
  const existingFilesCount = selectedFiles.filter(f => f.isExisting).length;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const currentNewFiles = newFiles.length;

    if (currentNewFiles + fileArray.length + existingFilesCount > NumberOfFileAllowed && !noLimit) {
      setError(`You can only upload ${NumberOfFileAllowed} files total.`);
      return;
    }

    setError('');

    const newFileItems: FileItem[] = fileArray.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      type: file.type,
      isExisting: false,
      size: file.size,
    }));

    const updatedFiles = multiple ? [...selectedFiles, ...newFileItems] : [newFileItems[0]];

    setSelectedFiles(updatedFiles);

    if (autoUpload) {
      handelSubmit(updatedFiles);
    }
  };

  const handleRemove = (fileId: string) => {
    const fileToRemove = selectedFiles.find(f => f.id === fileId);

    // Build the updated list first
    const updatedFiles = selectedFiles.filter(f => f.id !== fileId);

    // If it's an existing file, let the parent know (e.g. backend delete)
    if (fileToRemove?.isExisting && onFileRemove && fileId) {
      onFileRemove(fileId);
    } else if (!fileToRemove?.isExisting && onFileRemove) {
      // optional callback for new-file removal
      onFileRemove();
    }

    // Update local state
    setSelectedFiles(updatedFiles);
    setError('');

    // IMPORTANT: if autoUpload is enabled, inform parent about the new list
    if (autoUpload) {
      handelSubmit(updatedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const replaceId = e.target.getAttribute('data-replace-id');

    if (replaceId && files && files.length > 0) {
      // Replace mode - compute updatedFiles then set state + call parent
      const newFile = files[0];
      const newFileItem: FileItem = {
        id: `new-${Date.now()}-${Math.random()}`,
        file: newFile,
        name: newFile.name,
        type: newFile.type,
        isExisting: false,
      };

      const updatedFiles = selectedFiles.map(f => (f.id === replaceId ? newFileItem : f));

      setSelectedFiles(updatedFiles);

      if (autoUpload) {
        handelSubmit(updatedFiles);
      }

      // Clean up the replace attribute
      e.target.removeAttribute('data-replace-id');
    } else {
      // Normal upload mode
      handleFiles(files);
    }

    // Reset input
    e.target.value = '';
  };
  const bytesToMB = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2); // returns value in MB with 2 decimals
  };
  const getFilePreview = (fileItem: FileItem) => {
    if (fileItem.type.includes('image')) {
      const imageUrl = fileItem.url || (fileItem.file ? URL.createObjectURL(fileItem.file) : '');
      return (
        <Image
          imgPath={imageUrl}
          alt={fileItem.name}
          imageClassName='rounded-full object-contain object-center'
          className='w-16 h-16 rounded-full bg-surface'
        />
      );
    }

    return fileItem.type.includes('pdf') ? fileICON.PDF : fileICON.DOC;
  };

  const canAddMore = totalFiles < NumberOfFileAllowed || noLimit;

  return (
    <div className={clsx('relative', parentClassName)}>
      {label && (
        <label
          className={clsx(
            'text-base text-blackdark font-normal leading-5 block',
            labelClassName,
            labelNote ? 'mb-2.5' : 'mb-1.5'
          )}
        >
          {label}
        </label>
      )}
      {labelNote && (
        <span
          className={clsx(
            'text-xs text-blackdark font-normal leading-4 mb-1.5 block',
            labelNoteClassName
          )}
        >
          {labelNote}
        </span>
      )}
      {(selectedFiles.length === 0 || canAddMore) && (
        <div
          className={clsx(
            'relative w-full border-dashed border-2 border-surface hover:border-primary rounded-10px p-5 transition-all duration-300 ease-in-out',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            className
          )}
        >
          <InputField
            type='file'
            accept={accept}
            multiple={multiple}
            inputParentClassName='h-full w-full'
            inputClass='opacity-0 h-full w-full cursor-pointer'
            parentClassName='!absolute inset-0 z-10'
            onChange={handleFileChange}
          />
          <div className='flex justify-center items-center flex-col gap-2.5'>
            <div className='flex items-center justify-center w-12 h-12 bg-surface rounded-full'>
              <Icon
                name={selectedFiles.length === 0 ? 'image' : 'plus'}
                className='icon-wrapper w-7 h-7'
              />
            </div>
            <p className='text-primarygray text-base leading-5 font-normal text-center'>
              {noLimit || selectedFiles.length === 0
                ? 'Drop files here or click to upload'
                : `Add more files (${NumberOfFileAllowed - totalFiles} remaining)`}
            </p>
            <p className='text-primarygray text-sm leading-18px font-normal text-center'>
              {accept === '*/*' ? 'All file types supported' : `Accepted: ${accept}`}
            </p>
          </div>
        </div>
      )}
      {error && <p className='text-red-600 text-sm'>{error}</p>}
      {selectedFiles.length > 0 && (
        <div
          className={clsx(
            'flex flex-col gap-5',
            selectedFiles.length === 0 || canAddMore ? 'mt-5' : ''
          )}
        >
          {selectedFiles.map(fileItem => (
            <div
              key={fileItem.id}
              onClick={() => onFileClick?.(fileItem)}
              className={clsx(
                'relative group border border-solid border-surface rounded-10px overflow-hidden bg-Gray cursor-pointer p-2.5 flex items-center justify-between'
              )}
            >
              <div className='flex items-center gap-3 w-[calc(100%-40px)]'>
                {getFilePreview(fileItem)}
                <div className='flex flex-col gap-1.5 w-[calc(100%-76px)]'>
                  <p
                    className='text-sm font-semibold text-blackdark truncate w-full'
                    title={fileItem.name}
                  >
                    {fileItem.name}
                  </p>
                  <span className='text-sm text-primarygray'>
                    {/* {bytesToMB(fileItem.file?.size as number)}mb */}
                    {bytesToMB(fileItem.size || fileItem.file?.size || 0)}mb
                  </span>
                </div>
              </div>
              {(!fileItem.isExisting || canRemoveExisting) && !disabled && (
                <Button
                  variant='none'
                  icon={<Icon name='close' />}
                  onClick={e => {
                    e.stopPropagation();
                    handleRemove(fileItem.id);
                  }}
                  className='bg-red text-white rounded-full !p-1 shadow hover:bg-red-600 transition-colors'
                />
              )}
            </div>
          ))}
        </div>
      )}
      {selectedFiles.length > 0 && !autoUpload && (
        <div className='flex justify-between items-center mt-5'>
          {newFiles.length > 0 && (
            <span className='text-base text-blackdark leading-5 font-semibold'>
              {newFiles.length} new file{newFiles.length > 1 ? 's' : ''} ready to upload
            </span>
          )}
          <Button
            variant='filled'
            title='Submit'
            className='rounded-10px !py-2.5 !px-6'
            type='submit'
            onClick={() => handelSubmit(selectedFiles)}
            isLoading={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
