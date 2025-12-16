import { useQuery } from '@/api';
import { axiosGet } from '@/api/axios.ts';
import { stateQueryKey } from '@/api/common/state.queryKey';

const BASE_PATH = '/states';
const CREDENTIAL_STATE_BASE_PATH = '/credentialing-states';

// // Async function for infinite scrolling states
// export const getStatesAsync = async (page?: number, searchTerm?: string) => {
//   try {
//     const response = await axiosGet(BASE_PATH, {
//       params: {
//         ...(searchTerm ? { search: searchTerm } : {}),
//         page: page || 1,
//         limit: 10,
//       },
//     });
//     const totalCount = response?.data?.data?.total || 0;

//     const states = response?.data?.data?.data || [];
//     const hasMore = totalCount > (page || 1) * 10;

//     const transformedData = states.map((state: { id: string; name: string; code?: string }) => ({
//       value: state.id,
//       label: state.name,
//     }));

//     return {
//       data: transformedData,
//       hasMore: hasMore,
//     };
//   } catch (e) {
//     console.error('Failed to get states:', e);
//     return {
//       data: [],
//       hasMore: false,
//     };
//   }
// };

// // Get states by country
// export const getStatesByCountryAsync = async (
//   countryId: string,
//   page?: number,
//   searchTerm?: string
// ) => {
//   try {
//     const response = await axiosGet(`${BASE_PATH}/country`, {
//       params: {
//         country_id: countryId,
//         ...(searchTerm ? { search: searchTerm } : {}),
//         page: page || 1,
//         limit: 10,
//       },
//     });

//     const states = response?.data?.data?.data || [];
//     const hasMore = response?.data?.data?.hasMore || false;

//     const transformedData = states.map((state: { id: string; name: string; code?: string }) => ({
//       value: state.id,
//       label: state.name,
//     }));

//     return {
//       data: transformedData,
//       hasMore: hasMore,
//     };
//   } catch (e) {
//     console.error('Failed to get states by country:', e);
//     return {
//       data: [],
//       hasMore: false,
//     };
//   }
// };

// export const useGetStates = (params?: { page?: number; limit?: number; search?: string }) => {
//   return useQuery({
//     queryKey: stateQueryKey.getStatesKey(),
//     queryFn: async () => {
//       const response = await axiosGet(BASE_PATH, {
//         params: {
//           page: params?.page || 1,
//           limit: params?.limit || 10,
//           ...(params?.search ? { search: params.search } : {}),
//         },
//       });

//       if (response?.data?.data?.length) {
//         return {
//           data: response.data.data,
//           total: response.data.total,
//           currentPage: response.data.currentPage,
//         };
//       }

//       return {
//         data: [],
//         total: 0,
//         currentPage: 1,
//       };
//     },
//     experimental_prefetchInRender: true,
//   });
// };

// // Regular useQuery hook for states by country
// export const useGetStatesByCountry = (
//   countryId: string,
//   data: {
//     options?: CustomUseQueryOptions<ApiResponse<GetStatesResponse>, AxiosError>;
//     extraParams?: UseQueryRestParamsType;
//   }
// ) => {
//   const { options, extraParams } = data || {};
//   return useQuery({
//     queryKey: stateQueryKey.getStatesByCountryKey(countryId),
//     queryFn: async () => {
//       const response = await axiosGet(`${BASE_PATH}/country`, {
//         params: { country_id: countryId },
//       });
//       return response?.data || [];
//     },
//     enabled: !!countryId,
//     ...options,
//     ...extraParams,
//   });
// };

// Get state by ID
// export const useGetStateById = (id?: string) => {
//   return useQuery({
//     queryKey: stateQueryKey.getStateByIdKey(id),
//     queryFn: async () => {
//       if (!id) return null;
//       const response = await axiosGet(`${BASE_PATH}/${id}`);
//       return response?.data?.data;
//     },
//     enabled: !!id,
//   });
// };

// // Create state
// export const useCreateState = () => {
//   const { invalidate } = useInvalidateQuery();

//   return useMutation({
//     mutationFn: async (data: { name: string; code?: string }) => {
//       const response = await axiosPost(BASE_PATH, { data });
//       return response.data;
//     },
//     onSuccess: value => {
//       invalidate(stateQueryKey.getStatesKey(value));
//     },
//   });
// };

// // Update state
// export const useUpdateState = () => {
//   const { invalidate } = useInvalidateQuery();

//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: { name: string; code?: string } }) => {
//       const response = await axiosPut(`${BASE_PATH}/${id}`, { data });
//       return response.data;
//     },
//     onSuccess: value => {
//       invalidate(stateQueryKey.getStatesKey(value));
//     },
//   });
// };

// Delete state
// export const useDeleteState = () => {
//   const { invalidate } = useInvalidateQuery();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       const response = await axiosDelete(`${BASE_PATH}/${id}`);
//       return response.data;
//     },
//     onSuccess: value => {
//       invalidate(stateQueryKey.getStatesKey(value));
//     },
//   });
// };

export const getCredentialStatesAsync = async (page?: number, searchTerm?: string) => {
  try {
    const response = await axiosGet(CREDENTIAL_STATE_BASE_PATH, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
      },
    });
    const totalCount = response?.data?.data?.total || 0;

    const states = response?.data?.data?.data || [];

    const hasMore = totalCount > (page || 1) * 10;

    const transformedData = states.map(
      (state: {
        state: {
          id: string;
          name: string;
        };
      }) => ({
        value: state?.state?.id,
        label: state?.state?.name,
      })
    );

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (e) {
    console.error('Failed to get states:', e);
    return {
      data: [],
      hasMore: false,
    };
  }
};

// export const useGetCredentialStates = (params?: {
//   page?: number;
//   limit?: number;
//   search?: string;
// }) => {
//   return useQuery({
//     queryKey: stateQueryKey.getStatesKey(params || {}),
//     queryFn: async () => {
//       const response = await axiosGet(CREDENTIAL_STATE_BASE_PATH, {
//         params: {
//           page: params?.page || 1,
//           limit: params?.limit || 10,
//           ...(params?.search ? { search: params.search } : {}),
//         },
//       });

//       if (response?.data?.data?.data.length) {
//         return {
//           data: response.data.data,
//           total: response.data.data.total,
//           currentPage: response.data.data.data.page,
//         };
//       }

//       return {
//         data: [],
//         total: 0,
//         currentPage: 1,
//       };
//     },
//     experimental_prefetchInRender: true,
//   });
// };

// export const useCreateCredentialState = () => {
//   const { invalidate } = useInvalidateQuery();

//   return useMutation({
//     mutationFn: async (data: { name: string }) => {
//       const response = await axiosPost(CREDENTIAL_STATE_BASE_PATH, { data });
//       return response.data;
//     },
//     onSuccess: () => {
//       invalidate(stateQueryKey.getStatesKey());
//     },
//   });
// };

// export const useUpdateCredentialItemsState = () => {
//   const { invalidate } = useInvalidateQuery();

//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
//       const response = await axiosPut(`${CREDENTIAL_STATE_BASE_PATH}/${id}`, { data });
//       return response.data;
//     },
//     onSuccess: () => {
//       invalidate(stateQueryKey.getStatesKey());
//     },
//   });
// };

// export const useDeleteCredentialItemsState = () => {
//   const { invalidate } = useInvalidateQuery();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       const response = await axiosDelete(`${CREDENTIAL_STATE_BASE_PATH}/${id}`);
//       return response.data;
//     },
//     onSuccess: () => {
//       invalidate(stateQueryKey.getStatesKey());
//     },
//   });
// };

// export const useGetCredentialItemsStateById = (id?: string) => {
//   return useQuery({
//     queryKey: stateQueryKey.getStateByIdKey(id),
//     queryFn: async () => {
//       if (!id) return null;
//       const response = await axiosGet(`${CREDENTIAL_STATE_BASE_PATH}/${id}`);
//       return response?.data;
//     },
//     enabled: !!id,
//   });
// };

// Get all credentialed states
export const useGetAllCredentialedStates = (params?: { isCredentialed?: boolean }) => {
  return useQuery({
    queryKey: stateQueryKey.getAllCredentialedStatesKey(params?.isCredentialed),
    queryFn: async () => {
      const response = await axiosGet(`${BASE_PATH}/all`, {
        params: {
          ...(params?.isCredentialed !== undefined
            ? { isCredentialed: params.isCredentialed }
            : {}),
        },
      });

      return response?.data || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });
};
