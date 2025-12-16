import { useMutation, useQuery } from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { clinicAddressesQueryKey } from '@/api/common/clinic-addresses.queryKey';
import { mutationsQueryKey } from '@/api/common/mutations.queryKey';
import { useInvalidateQuery } from '@/hooks/data-fetching';

const BASE_PATH = '/clinic-addresses';

export const useCreateClinicAddress = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (data: object) => {
      const response = await axiosPost(`${BASE_PATH}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidate(clinicAddressesQueryKey.getClinicAddressesList({}));
    },
  });
};

export const useGetClinicAddressesList = (params: object) => {
  return useQuery({
    queryKey: clinicAddressesQueryKey.getClinicAddressesList({ params }),
    queryFn: () =>
      axiosGet(`${BASE_PATH}/`, {
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

export const useGetClinicAddressById = (id: string | undefined) => {
  return useQuery({
    queryKey: clinicAddressesQueryKey.getClinicAddressById(id),
    queryFn: () => axiosGet(`${BASE_PATH}/${id}`),
    select: res => {
      if (res.data) {
        return res.data;
      }
      return null;
    },
    enabled: !!id,
  });
};

export const useUpdateClinicAddress = () => {
  const { invalidate } = useInvalidateQuery();
  let clinicAddId: string;
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: object }) => {
      clinicAddId = id;
      const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
      return response.data;
    },
    onSuccess: () => {
      invalidate(clinicAddressesQueryKey.getClinicAddressesList({}));
      invalidate(clinicAddressesQueryKey.getClinicAddressById(clinicAddId));
    },
  });
};

export const useDeleteClinicAddress = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationKey: mutationsQueryKey.deleteClinicAddress(),
    mutationFn: (id: string) => axiosDelete(`${BASE_PATH}/${id}`),
    onSuccess: () => {
      invalidate(clinicAddressesQueryKey.getClinicAddressesList({}));
    },
  });
};

export const getClinicAddressesListAsync = async (page?: number, searchTerm?: string) => {
  try {
    const response = await axiosGet(`${BASE_PATH}/`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
      },
    });
    const fieldOptions = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = fieldOptions.map(
      (item: { id: string; name: string; address: string }) => ({
        value: item.id,
        label: `${item.name} - ${item.address}`,
      })
    );

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error(`Failed to get clinic address list:`, error);
    return {
      data: [],
      hasMore: false,
    };
  }
};
