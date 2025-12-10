// In "@/api/video-call"
import { axiosGet, axiosPost } from '@/api/axios';
import type { InfiniteTherapistPageResponse } from '@/api/types/therapist.dto';

import { fieldOptionsQueryKey } from './common/fieldOptions.queryKey';
import { mutationsQueryKey } from './common/mutations.queryKey';
import { notesOptionsQueryKey } from './common/notes.queryKey';
import { tagQueryKey } from './common/tag.query';

import { useInfiniteQuery, useMutation, useQuery } from '.';

export interface WidgetInfiniteType {
  type?: string;
  appointment_id?: string;
}

export const useInfiniteWidgetsQuery = (param?: WidgetInfiniteType) => {
  return useInfiniteQuery<InfiniteTherapistPageResponse>({
    queryKey: fieldOptionsQueryKey.getFieldOptionsList({ param }),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosGet(`/appointment-widget`, {
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
      const response = await axiosPost('/appointment-widget', data);
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
      const res = await axiosGet(`/appointment-session-tag`, {
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
      const response = await axiosPost('/appointment-session-tag', data);
      return response.data;
    },
    showToast: false,
  });
};
