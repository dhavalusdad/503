import { useMutation, useQuery } from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { credentialingItemQueryKey } from '@/api/common/credentialingItems.queryKey';
import { useInvalidateQuery } from '@/hooks/data-fetching';

const BASE_PATH = '/credentialing-items';

export const useCreateCredentialingItems = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (data: object) => {
      const response = await axiosPost(BASE_PATH, { data: data });
      return response.data;
    },
    onSuccess: value => {
      invalidate(credentialingItemQueryKey.getCredentialingItems(value));
    },
  });
};

export const useGetCredentialingItems = (params: object) => {
  return useQuery({
    queryKey: credentialingItemQueryKey.getCredentialingItems(params),
    queryFn: () =>
      axiosGet(`${BASE_PATH}`, {
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

export const useUpdateCredentialingItems = (id: string) => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (data: object) => {
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data: data });
      return response.data;
    },
    onSuccess: id => {
      invalidate(credentialingItemQueryKey.getCredentialingItems(id));
    },
  });
};

export const useGetCredentialingItemsById = (id: string) => {
  return useQuery({
    queryKey: credentialingItemQueryKey.getCredentialingItems(id),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDeleteCredentialItem = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosDelete(`${BASE_PATH}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate(credentialingItemQueryKey.getCredentialingItems({}));
    },
  });
};
