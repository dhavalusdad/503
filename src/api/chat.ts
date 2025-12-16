import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  type CustomUseMutationOptions,
  type UseQueryRestParamsType,
} from '@/api';
import { axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { chatQueryKeys } from '@/api/common/chat.queryKey';
import type { ApiResponse } from '@/api/types/common.dto';
import type { ChatSearchResponseType, ChatSessionsPage, MessageType } from '@/features/chat/types';
import { useInvalidateQuery, useRemoveQueries } from '@/hooks/data-fetching';

import type { InfiniteData, QueryFunctionContext } from '@tanstack/react-query';

const BASE_PATH = '/chat';

export const useSendChatMessage = ({
  onSuccess,
}: {
  onSuccess?: (response: ApiResponse<MessageType>) => void; // or better typed if you have the response type
}) => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({
      sessionId,
      message,
      messageType,
    }: {
      sessionId: string;
      message: string;
      messageType: string;
    }) => {
      const response = await axiosPost(`${BASE_PATH}/messages/send`, {
        data: { sessionId, message, messageType },
      });
      return response.data;
    },
    onSuccess: data => {
      if (onSuccess) onSuccess(data);
      invalidate(chatQueryKeys.sessions());
    },
    showToast: false,
  });
};

export const useInfiniteMessage = ({
  limit = 10,
  sessionId,
}: {
  limit?: number;
  sessionId: string;
}) => {
  return useInfiniteQuery({
    queryKey: chatQueryKeys.messages(sessionId),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}/messages/${sessionId}`, {
        params: {
          page: pageParam,
          limit,
        },
      });
      const payload = response.data;
      const items = payload?.data?.data ?? [];

      const total = payload?.data?.total ?? 0;
      return {
        items,
        nextPage: pageParam * limit < total ? pageParam + 1 : undefined,
        prevPage: pageParam > 1 ? pageParam - 1 : undefined,
        total,
      } as {
        items: MessageType[];
        nextPage: number | undefined;
        prevPage: number | undefined;
        total: number;
      };
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    getPreviousPageParam: firstPage => firstPage?.prevPage,
    initialPageParam: 1,
    refetchOnMount: true,
    select: data => data.pages.flatMap(page => page.items),
  });
};

export const useMarkMessagesAsRead = () => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const response = await axiosPut(`${BASE_PATH}/messages/read`, {
        data: { sessionId },
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate(chatQueryKeys.sessions());
      invalidate(['chat', 'totalUnread']);
    },
    showToast: false,
  });
};

export const useClearChatMessages = ({ onSuccess }: { onSuccess: () => void }) => {
  const { invalidate } = useInvalidateQuery();
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const response = await axiosPost(`${BASE_PATH}/messages/clear`, {
        data: { sessionId },
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      if (onSuccess) onSuccess();
      const { sessionId } = variables;
      // invalidate sessions and messages so UI refreshes
      invalidate(chatQueryKeys.sessions());
      invalidate(chatQueryKeys.messages(sessionId));
    },
    showToast: true,
  });
};

export const useGetTotalUnreadCount = () => {
  return useQuery({
    queryKey: ['chat', 'totalUnread'],
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/unread-count`);
      return response.data;
    },
    select: data => data.totalUnread,
  });
};

export const useUploadMessageFiles = (payload: {
  options?: CustomUseMutationOptions<
    ApiResponse<MessageType>,
    unknown,
    FormData,
    readonly unknown[]
  >;
  extraParams?: UseQueryRestParamsType;
  onSuccess?: (response: ApiResponse<MessageType>) => void;
}) => {
  const { options, extraParams, onSuccess } = payload;
  const { invalidate } = useInvalidateQuery();
  return useMutation<ApiResponse<MessageType>, unknown, FormData, readonly unknown[]>({
    mutationFn: async (data: FormData) => {
      const response = await axiosPost(`${BASE_PATH}/upload-message-files`, {
        data,
      });
      return response.data;
    },
    onSuccess: data => {
      if (onSuccess) onSuccess(data);
      invalidate(chatQueryKeys.sessions());
    },
    ...options,
    ...extraParams,
    showToast: false,
  });
};

export const useSearchChatMessages = ({
  sessionId,
  search,
  enabled = true,
  chatId,
  onBeforeReturn,
}: {
  sessionId: string;
  search: string;
  enabled?: boolean;
  chatId?: string;
  onBeforeReturn?: (data: ChatSearchResponseType) => Promise<void> | void;
}) => {
  const { removeQuery } = useRemoveQueries();

  return useQuery({
    queryKey: chatQueryKeys.search(sessionId, search),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/messages/search/${sessionId}`, {
        params: { search },
      });
      removeQuery(chatQueryKeys.messages(chatId || ''));

      if (onBeforeReturn) {
        await onBeforeReturn(response.data.data);
      }
      return response.data;
    },
    showToast: false,
    enabled: !!sessionId && !!search && enabled,
    select: data => data.results,
  });
};

export const useUpdateActiveChatSession = () => {
  return useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string | null }) => {
      const response = await axiosPut(`${BASE_PATH}/active-chat`, {
        data: { sessionId },
      });
      return response.data;
    },
    showToast: false,
  });
};

export const useMuteChatSession = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async ({ sessionId, action }: { sessionId: string; action: string }) => {
      const response = await axiosPut(`${BASE_PATH}/update/mute`, {
        data: { sessionId, action },
      });
      return response.data;
    },
    onSuccess: () => {
      invalidate(chatQueryKeys.sessions());
    },
    showToast: false,
  });
};

export const useInfiniteChatSessions = ({
  limit = 10,
  search,
  enabled = true,
}: {
  limit?: number;
  search?: string;
  enabled?: boolean;
}) => {
  return useInfiniteQuery<ChatSessionsPage, Error, InfiniteData<ChatSessionsPage>>({
    queryKey: chatQueryKeys.sessions(),
    queryFn: async (context: QueryFunctionContext) => {
      const page = (context.pageParam as number) ?? 1;

      const response = await axiosGet(`${BASE_PATH}/sessions`, {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      });

      const payload = response.data;
      const items = payload?.data?.data ?? [];
      const total = payload?.data?.total ?? 0;

      return {
        items,
        nextPage: page * limit < total ? page + 1 : undefined,
        prevPage: page > 1 ? page - 1 : undefined,
        total,
      };
    },

    getNextPageParam: lastPage => lastPage?.nextPage,
    getPreviousPageParam: firstPage => firstPage?.prevPage,
    initialPageParam: 1,
    enabled,
  });
};
