import { allowedMessageFileTypes } from '@/constants/CommonConstant';
import type { MessageType, PaginatedMessages } from '@/features/chat/types';

export function groupMessagesByDate(messages: MessageType[]): [string, MessageType[]][] {
  if (!messages || messages.length === 0) return [];

  const grouped: Record<string, MessageType[]> = Object.create(null);

  for (const msg of messages) {
    const date = new Date(msg.created_at);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dateKey = `${day}/${month}/${year}`;

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].unshift(msg);
  }

  // Convert to desired output format: [ [date, messages[]], ... ]
  const result = Object.entries(grouped);

  return result;
}

export const updateInfiniteQueryPage = (
  oldData: PaginatedMessages | undefined,
  pageIndex: number,
  updater: (items: MessageType[]) => MessageType[]
): PaginatedMessages | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page, index) =>
      index === pageIndex ? { ...page, items: updater(page.items) } : page
    ),
  };
};

export const updateAllInfiniteQueryPages = (
  oldData: PaginatedMessages | undefined,
  updater: (items: MessageType[]) => MessageType[]
): PaginatedMessages | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map(page => ({
      ...page,
      items: updater(page.items),
    })),
  };
};

export const validateFiles = (files: File[]): { valid: boolean; error: string } => {
  const invalidFiles = files.filter(file => !allowedMessageFileTypes.includes(file.type));

  if (invalidFiles.length > 0) {
    return {
      valid: false,
      error: 'Invalid file type. Only PNG, JPEG, PDF, DOC, and DOCX files are allowed.',
    };
  }

  return { valid: true, error: '' };
};

export const isImageFile = (url: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};
