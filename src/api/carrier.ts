import { axiosGet } from '@/api/axios.ts';

const BASE_PATH = '/carrier';

export const getCarrierByStateAsync = async (
  page: number = 1,
  searchTerm: string = '',
  stateId: string = '',
  extraParams?: Record<string, string>
) => {
  try {
    if (!stateId) {
      return {
        data: [],
        hasMore: false,
      };
    }
    const response = await axiosGet(`${BASE_PATH}/state/${stateId}`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
        ...(extraParams || {}),
      },
    });
    const totalCount = response?.data?.data?.total || 0;

    const states = response?.data?.data?.data || [];
    const hasMore = totalCount > (page || 1) * 10;

    const transformedData = states.map(
      (state: { id: string; carrier_name: string; code?: string }) => ({
        value: state.id,
        label: state.carrier_name,
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
