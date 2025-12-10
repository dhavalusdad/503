import React, { useEffect, useMemo } from 'react';

import Button from '../Button';
import Icon from '../Icon';
import { Modal, type ModalSizeType } from '../Modal';

export interface MediaFile {
  url?: string;
  file?: File;
  type: string;
  name: string;
  id?: string;
}

export interface MediaViewerModalProps {
  isOpen: boolean;
  files: MediaFile[];
  initialIndex?: number;
  onClose: () => void;
  showNavigation?: boolean;
  showCounter?: boolean;
  allowDownload?: boolean;
  modalSize?: ModalSizeType;
  onNavigate?: (index: number) => void;
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  files,
  initialIndex = 0,
  onClose,
  showNavigation = true,
  showCounter = true,
  allowDownload = true,
  modalSize = 'lg',
  onNavigate,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Reset index when modal opens with different initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const currentFile = useMemo(() => files[currentIndex], [files, currentIndex]);

  const handlePrev = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(currentIndex + 1, files.length - 1);
    setCurrentIndex(newIndex);
    onNavigate?.(newIndex);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !showNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && currentIndex < files.length - 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, files.length, showNavigation]);

  const getFileUrl = (file: MediaFile): string => {
    return file.file ? URL.createObjectURL(file.file) : file.url || '';
  };

  const renderMedia = () => {
    if (!currentFile) {
      return (
        <div className='flex items-center justify-center p-8 text-gray-500'>
          <p>No file available</p>
        </div>
      );
    }

    const { type, name } = currentFile;
    const fileUrl = getFileUrl(currentFile);

    // Image files
    if (type.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={name}
          className='min-w-60 min-h-60 max-w-full max-h-[70vh] object-contain'
        />
      );
    }

    // PDF files
    if (type === 'application/pdf') {
      return (
        <embed src={fileUrl} type='application/pdf' className='w-full h-[70vh]' title={name} />
      );
    }

    // Text files
    if (type.startsWith('text/')) {
      return (
        <iframe
          src={fileUrl}
          className='w-full h-[70vh] bg-white'
          title={name}
          sandbox='allow-same-origin'
        />
      );
    }

    // Fallback for unsupported types
    return (
      <div className='flex flex-col items-center justify-center p-8 border rounded bg-gray-50 gap-4'>
        <Icon name='file' width={64} height={64} className='text-gray-400' />
        <p className='text-gray-700 text-center font-medium'>{name}</p>
        <p className='text-gray-500 text-sm'>Preview not available for this file type</p>
        {allowDownload && (
          <a
            href={fileUrl}
            download={name}
            className='text-blue-600 underline hover:text-blue-800 font-medium'
          >
            Download File
          </a>
        )}
      </div>
    );
  };

  const shouldShowPrevious = showNavigation && files.length > 1 && currentIndex > 0;
  const shouldShowNext = showNavigation && files.length > 1 && currentIndex < files.length - 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      title={currentFile?.name || 'Media Viewer'}
      closeButton={true}
      contentClassName='flex flex-col items-center justify-center p-0 border-none relative'
      className='bg-black bg-opacity-90'
    >
      <div className='relative flex items-center justify-center w-full h-full'>
        {/* Previous Button */}
        {shouldShowPrevious && (
          <Button
            variant='filled'
            onClick={handlePrev}
            parentClassName='!absolute left-4 z-10'
            className='rounded-full !p-3 shadow-lg hover:scale-110'
            aria-label='Previous file'
          >
            <Icon name='chevronLeft' width={24} height={24} />
          </Button>
        )}

        {/* Media Content */}
        <div className='flex items-center justify-center w-full h-full px-16'>{renderMedia()}</div>

        {/* Next Button */}
        {shouldShowNext && (
          <Button
            variant='filled'
            onClick={handleNext}
            parentClassName='!absolute right-4 z-10'
            className='rounded-full !p-3 shadow-lg hover:scale-110'
            aria-label='Next file'
          >
            <Icon name='chevronRight' width={24} height={24} />
          </Button>
        )}

        {/* Counter */}
        {showCounter && files.length > 1 && (
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium'>
            {currentIndex + 1} / {files.length}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MediaViewerModal;
