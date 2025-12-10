import { axiosGet } from '@/api/axios.ts';

const BASE_PATH = '/language';

// Async function for infinite scrolling with CustomAsyncSelect
export const getLanguagesAsync = async (page?: number, searchTerm?: string) => {
  try {
    const params: Record<string, string | number> = {};
    if (page) {
      params.page = page;
      params.limit = 10;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }

    const response = await axiosGet(BASE_PATH, { params });

    const languages = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = languages.map((item: { id: string; name: string }) => ({
      value: item.id,
      label: item.name,
    }));

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (e) {
    console.error(`Failed to get languages:`, e);
    return {
      data: [],
      hasMore: false,
    };
  }
};

// export const useGetLanguages = (data: {
//   options?: CustomUseQueryOptions<ApiResponse<GetLanguagesResponse>, AxiosError>;
//   extraParams?: UseQueryRestParamsType;
// }) => {
//   const { options, extraParams } = data || {};
//   return useQuery({
//     queryKey: languageQueryKey.getLanguagesKey(),
//     queryFn: async () => {
//       const response = await axiosGet(BASE_PATH);
//       return response?.data || [];
//     },
//     ...options,
//     ...extraParams,
//     staleTime: Infinity,
//   });
// };

// Infinite query hook for languages
// export const useInfiniteLanguages = (data?: { search?: string; enabled?: boolean }) => {
//   const { search = '', enabled = true } = data || {};

//   return useInfiniteQueryRQ({
//     queryKey: [...languageQueryKey.getLanguagesKey(), search],
//     queryFn: async ({ pageParam = 1 }) => {
//       return await getLanguagesAsync(pageParam as number, search);
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       return lastPage.hasMore ? allPages.length + 1 : undefined;
//     },
//     initialPageParam: 1,
//     staleTime: Infinity,
//     enabled,
//   });
// };
