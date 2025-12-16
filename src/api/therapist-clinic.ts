import { axiosGet } from '@/api/axios';

const BASE_PATH = '/clinics';

export interface ClinicAddressData {
  id: string;
  name: string;
  address: string;

  city: {
    name: string;
  };
  state: {
    name: string;
  };
}

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

    const transformedData = options.map((item: ClinicAddressData) => ({
      value: item.id,
      label: `${item.name} : ${item.address}, ${item?.city?.name}, ${item?.state?.name}`,
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
