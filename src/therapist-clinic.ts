import { axiosGet } from './api/axios';

const BASE_PATH = '/clinics';

export const getTherapistClinicAsync = async (
  page?: number,
  searchTerm?: string,
  therapist_id?: string
) => {
  try {
    const response = await axiosGet(`${BASE_PATH}`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
        therapist_id,
      },
    });

    const options = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = options.map((item: { id: string; name: string }) => ({
      value: item.id,
      label: item.name,
    }));

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (e) {
    console.error(`Failed to get therapist clinics:`, e);
    return {
      data: [],
      hasMore: false,
    };
  }
};
