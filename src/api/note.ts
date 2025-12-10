import { useQueryClient, type QueryFunctionContext } from '@tanstack/react-query';

import { axiosGet, axiosPost, axiosPut } from '@/api/axios.ts';
import type { SessionNote } from '@/features/appointment';
import { useInvalidateQuery, useResetQueries } from '@/hooks/data-fetching';

import { mutationsQueryKey } from './common/mutations.queryKey';
import { notesOptionsQueryKey } from './common/notes.queryKey';

import { useInfiniteQuery, useMutation, useQuery } from '.';

const BASE_PATH = '/notes';

export const useCreateNote = (appointment_id: string, note_type: string) => {
  const { resetQuery } = useResetQueries();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationsQueryKey.createNote(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}`, data);
      return response.data;
    },
    onSuccess: () => {
      resetQuery(notesOptionsQueryKey.getNotesByAppointment(appointment_id, note_type));

      queryClient.refetchQueries({
        queryKey: notesOptionsQueryKey.getNotesByAppointment('', '', {
          isDraft: true,
          sortColumn: 'created_at',
          sortOrder: 'desc',
        }),
        exact: false,
      });
    },
  });
};

export const useInfiniteNotesByAppointment = ({
  appointment_id,
  note_type,
  enabled = true,
  limit = 10,
  sortColumn,
  sortOrder,
  search,
}: {
  appointment_id: string;
  note_type: string;
  enabled?: boolean;
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
}) => {
  return useInfiniteQuery({
    queryKey: notesOptionsQueryKey.getNotesByAppointment(appointment_id, note_type, {
      sortColumn,
      sortOrder,
      search,
    }),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}/appointment/${appointment_id}`, {
        params: {
          note_type,
          page: pageParam,
          limit,
          ...(sortColumn && { sortColumn }),
          ...(sortOrder && { sortOrder }),
          ...(search && { search }),
        },
      });
      const payload = response.data;
      const items = payload?.data?.data ?? [];
      const total = payload?.data?.total ?? 0;
      return {
        items,
        nextPage: pageParam * limit < total ? pageParam + 1 : undefined,
        total,
      } as { items: SessionNote[]; nextPage: number | undefined; total: number };
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
    enabled: !!appointment_id && !!note_type && enabled,
  });
};

export const useInfiniteNotes = ({
  note_type,
  limit = 10,
  sortColumn,
  sortOrder,
  search,
  isDraft,
}: {
  note_type: string;
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
  isDraft?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: notesOptionsQueryKey.getNotesByAppointment('', note_type, {
      sortColumn,
      sortOrder,
      search,
      isDraft,
    }),
    queryFn: async (context: QueryFunctionContext) => {
      const pageParam = (context.pageParam as number) ?? 1;
      const response = await axiosGet(`${BASE_PATH}`, {
        params: {
          note_type,
          page: pageParam,
          limit,
          is_draft: isDraft,
          ...(sortColumn && { sortColumn }),
          ...(sortOrder && { sortOrder }),
          ...(search && { search }),
        },
      });

      const payload = response.data;
      const items = payload?.data?.data ?? [];

      const total = payload?.data?.total ?? 0;
      return {
        items,
        nextPage: pageParam * limit < total ? pageParam + 1 : undefined,
        total,
      } as { items: SessionNote[]; nextPage: number | undefined; total: number };
    },
    getNextPageParam: lastPage => lastPage?.nextPage,
    initialPageParam: 1,
  });
};

export const useGetNoteById = (id: string | undefined) => {
  return useQuery({
    queryKey: notesOptionsQueryKey.getNoteById(id),
    queryFn: () => axiosGet(`${BASE_PATH}/${id}`),
    select: res => {
      if (res.data) {
        return res.data;
      }
      return null;
    },
    enabled: !!id,
    // experimental_prefetchInRender: true,
    // staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateNote = (appointment_id: string, note_type: string) => {
  const { invalidate } = useInvalidateQuery();
  const { resetQuery } = useResetQueries();

  return useMutation({
    mutationKey: mutationsQueryKey.updateNote(),
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      axiosPut(`${BASE_PATH}/${id}`, { data }),
    onSuccess: (_, { id }) => {
      invalidate(notesOptionsQueryKey.getNoteById(id));
      resetQuery(notesOptionsQueryKey.getNotesByAppointment(appointment_id, note_type));
    },
  });
};
