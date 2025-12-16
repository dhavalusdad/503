import { useMutation, useQuery } from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios.ts';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { tagQueryKey } from '@/api/common/tag.query';
import { useInvalidateQuery } from '@/hooks/data-fetching';

const BASE_PATH = '/tag';

export const useGetTagList = (params: object) => {
  return useQuery({
    queryKey: tagQueryKey.getTagList({ params }),
    queryFn: () =>
      axiosGet(`${BASE_PATH}/list`, {
        params: {
          ...params,
        },
      }),
    select: res => {
      if (res.data?.data?.length) {
        return res.data;
      }
      return {
        data: [],
        total: res.data?.total,
        currentPage: res.data?.currentPage,
      };
    },
    experimental_prefetchInRender: true,
  });
};
export const useCreateTag = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.createTag(),
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}/create`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidate(tagQueryKey.getTagList());
    },
  });
};

export const useGetTagById = (id: string | undefined) => {
  return useQuery({
    queryKey: tagQueryKey.getTagById(id),
    queryFn: () => axiosGet(`${BASE_PATH}/${id}`),
    select: res => {
      if (res.data) {
        return res.data;
      }
      return null;
    },
    enabled: !!id,
    experimental_prefetchInRender: true,
  });
};

export const useUpdateTag = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.updateTag(),
    mutationFn: async ({ id, data }: { id: string; data: object }) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      invalidate(tagQueryKey.getTagById(id));
      invalidate(tagQueryKey.getTagList());
    },
  });
};
export const useDeleteTag = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.deleteFieldOptions(),
    mutationFn: (id: string) => axiosDelete(`${BASE_PATH}/${id}`),
    onSuccess: () => {
      invalidate(tagQueryKey.getTagList());
    },
  });
};

export const useGetSessionTagById = (id: string | undefined) => {
  return useQuery({
    queryKey: tagQueryKey.getSessionTagById(id),
    queryFn: () => axiosGet(`appointment-session-tag/session-tag?appointment_id=${id}`),
    select: res => {
      if (res.data) {
        return res.data;
      }
      return null;
    },
    enabled: !!id,
    experimental_prefetchInRender: true,
  });
};
export const getCheckTagInUseById = async (id: string, type: string) => {
  const response = await axiosGet(`${BASE_PATH}/check?id=${id}&type=${type}`);
  return response.data;
};

export const getTagsAsync = async (page?: number, searchTerm?: string) => {
  try {
    const response = await axiosGet(`${BASE_PATH}/list`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
      },
    });
    const tags = response?.data?.data?.data || response?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = tags.map((tag: { id: string; name: string; color: string }) => ({
      value: tag.id,
      label: tag.name,
      color: tag.color,
    }));
    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error(`Failed to get tags:`, error);
    return {
      data: [],
      hasMore: false,
    };
  }
};
