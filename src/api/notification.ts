import { useQuery, useMutation, useInfiniteQuery } from '@/api';
import { axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { notificationQueryKeys } from './common/notification.query';

import type { QueryFunctionContext } from '@tanstack/react-query';

const BASE_PATH = '/notifications';

export const useGetNotifications = <T>(status: 'unread' | 'read' | 'all' = 'all') => {
  return useQuery({
    queryKey: notificationQueryKeys.list(status),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}`, { params: { status } }); // 👈 pass params here
      return response.data as T;
    },
  });
};

export const useInfiniteNotifications = ({
  status = 'all',
  limit = 10,
}: {
  status?: 'unread' | 'read' | 'all';
  limit?: number;
}) => {
  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list(status),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;

      const response = await axiosGet(`${BASE_PATH}`, {
        params: { status, page: pageParam, limit },
      });

      const payload = response.data.data;

      return {
        items: payload.data,
        nextPage: pageParam * limit < payload.total ? pageParam + 1 : undefined,
        total: payload.total,
        totalUnread: payload.totalUnread,
      };
    },
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 1,
    select: data => ({
      items: data.pages.flatMap(page => page.items),
      totalUnread: data.pages?.[0].totalUnread,
    }),
  });
};

export const useMarkNotificationsAsRead = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosPut(`${BASE_PATH}/mark-all-read`);
      return response.data;
    },
    onSuccess: () => {
      invalidate(notificationQueryKeys.list('unread'));
    },
    showToast: false,
  });
};

export const useMarkParticularNotificationAsRead = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await axiosPut(`${BASE_PATH}/mark-read/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate(notificationQueryKeys.list('unread'));
    },
    showToast: false,
  });
};

export const useNotifyParticipant = ({
  role,
  user_id,
}: {
  role?: string;
  tenant_id?: string;
  user_id: string;
}) => {
  return useMutation({
    mutationFn: async (payload: { recipientId: string; roomId: string; appointmentId: string }) => {
      const response = await axiosPost(`${BASE_PATH}/waiting-room/notify-participant`, {
        params: {
          ...(role ? { role } : {}),
          ...(user_id ? { user_id } : {}),
        },
        data: payload,
      });
      return response.data;
    },
    onError: error => {
      console.error('Failed to notify participant:', error);
    },
    showToast: false,
  });
};
