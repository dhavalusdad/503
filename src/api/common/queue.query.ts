import type { QueueMangementParamsType } from '@/api/types/user.dto';

export const QUEUE_KEYS_NAME = {
  LIST: 'backoffice-queue-list',
  DETAILS: 'backoffice-queue-details',
};

export const queueQueryKey = {
  getList: (params?: QueueMangementParamsType, userId?: string) =>
    ['queue', 'list', params, userId] as const,
  getQueueById: (id?: string) => [QUEUE_KEYS_NAME.DETAILS, id],
};
