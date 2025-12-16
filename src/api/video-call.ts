// In "@/api/video-call"
import { useInfiniteQuery, useMutation, useQuery } from '@/api';
import { axiosGet, axiosPost } from '@/api/axios';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { notesOptionsQueryKey } from '@/api/common/notes.queryKey';
import { tagQueryKey } from '@/api/common/tag.query';
import type { InfiniteTherapistPageResponse } from '@/api/types/therapist.dto';

export interface WidgetInfiniteType {
  type?: string;
  appointment_id?: string;
}

const WIDGET_BASE_PATH = '/appointment-widget';
const SESSION_TAG_BASE_PATH = '/appointment-session-tag';

export const useInfiniteWidgetsQuery = (param?: WidgetInfiniteType) => {
  return useInfiniteQuery<InfiniteTherapistPageResponse>({
    queryKey: fieldOptionsQueryKey.getFieldOptionsList({ param }),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosGet(`${WIDGET_BASE_PATH}`, {
        params: {
          ...param,
          page: pageParam,
          limit: 10,
        },
      });
      const pageData = res.data.data.data || [];
      const total = res.data.data.total || 0;
      return {
        data: pageData,
        total,
        hasMore: pageData.length > 0 && pageParam * 5 < total,
      };
    },
    gcTime: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + (page.data?.length || 0), 0);
      const total = allPages[0]?.total || 0;
      // Continue if more items expected or hasMore is true
      if (totalFetched < total || lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchOnMount: false,
  });
};

export const useAssignAndRemoveWidgetOptions = () => {
  return useMutation({
    mutationKey: mutationsQueryKey.assignAndRemoveReminderWidget(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${WIDGET_BASE_PATH}`, data);
      return response.data;
    },
    showToast: false,
  });
};

export const useGetLastNote = (params: {
  client_id: string;
  therapist_id: string;
  appointment_id: string;
}) => {
  return useQuery({
    queryKey: notesOptionsQueryKey.getLastNoteByClientAndTherapistId(),

    queryFn: async () => {
      const response = await axiosGet(`notes/previous-note`, {
        params,
      });
      return response.data;
    },
  });
};

export const useInfiniteSessionTagQuery = (param?: WidgetInfiniteType) => {
  return useInfiniteQuery<InfiniteTherapistPageResponse>({
    queryKey: tagQueryKey.getSessionTagWithSelectList({ param }),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosGet(`${SESSION_TAG_BASE_PATH}`, {
        params: {
          ...param,
          page: pageParam,
          limit: 10,
        },
      });
      const pageData = res.data.data.data || [];
      const total = res.data.data.total || 0;

      return {
        data: pageData,
        total,
        hasMore: pageData.length > 0 && pageParam * 5 < total,
      };
    },
    gcTime: 100,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + (page.data?.length || 0), 0);
      const total = allPages[0]?.total || 0;
      // Continue if more items expected or hasMore is true
      if (totalFetched < total || lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchOnMount: true,
  });
};

export const useAssignAndRemoveSessionTagOptions = () => {
  return useMutation({
    mutationKey: mutationsQueryKey.assignAndRemoveSessionTag(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${SESSION_TAG_BASE_PATH}`, data);
      return response.data;
    },
    showToast: false,
  });
};
