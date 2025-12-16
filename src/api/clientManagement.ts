import { keepPreviousData, useQueryClient } from '@tanstack/react-query';

import { useMutation, useQuery } from '@/api';
import { axiosDelete, axiosGet, axiosPost, axiosPut } from '@/api/axios';
import { CLIENT_KEYS_NAME, clientQueryKey } from '@/api/common/client.queryKey';
import type { ClientManagementParamsType } from '@/api/types/user.dto';
import { isDefined } from '@/api/utils';
import { TagType } from '@/enums';
import type {
  AssignRemoveTagPayload,
  CreateClientData,
  SetFlagPayload,
} from '@/features/admin/components/clientManagement/types';
import { showToast } from '@/helper';
import { useInvalidateQuery } from '@/hooks/data-fetching';

import { USER_KEYS_NAME } from './common/user.queryKey';

const CLIENT_BASE_PATH = '/client';
const TAGS_BASE_PATH = '/tag';
const USER_TAGS_BASE_PATH = '/user-tag';

export const getClientListForAdmin = async (
  page?: number,
  searchTerm?: string,
  extraParams?: Record<string, string>
) => {
  try {
    const response = await axiosGet(`${CLIENT_BASE_PATH}/get-client-list-for-admin`, {
      params: {
        ...(searchTerm ? { search: searchTerm } : {}),
        page: page || 1,
        limit: 10,
        ...(extraParams || {}),
      },
    });

    const fieldOptions = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = fieldOptions.map(
      (client: {
        id: string;
        user: { first_name: string; last_name: string; profile_image: string };
      }) => ({
        value: client.id,
        label: `${client.user?.first_name || ''} ${client.user?.last_name || ''}`.trim(),
        image: client.user?.profile_image,
        first_name: client.user?.first_name,
        last_name: client.user?.last_name,
      })
    );

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error(`Failed to get client list for admin:`, error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useGetClientAgreements = (user_id: string) => {
  return useQuery({
    queryKey: clientQueryKey.getUserAgreements(),
    queryFn: async () => {
      const response = await axiosGet(`${CLIENT_BASE_PATH}/${user_id}/agreements`);
      return response.data;
    },
  });
};

export const useGetClientManagementQuery = (params: ClientManagementParamsType) => {
  const { page, limit, search, filters, timezone, sortColumn, sortOrder } = params;
  const defaultData = {
    sortColumn: 'created_at',
    sortOrder: 'desc',
  };
  const modifiedData = {
    sortColumn: sortColumn || defaultData.sortColumn,
    sortOrder: sortOrder || defaultData.sortOrder,
  };
  return useQuery({
    queryKey: clientQueryKey.getList({
      ...params,
      ...modifiedData,
    }),
    queryFn: async () => {
      const queryParams = {
        page,
        limit,
        search: search ?? undefined,
        sortColumn: modifiedData.sortColumn,
        sortOrder: modifiedData.sortOrder,
        timezone,
        ...(filters && {
          ...(filters.status ? { status: filters.status?.value } : {}),
          ...(filters.joined_date?.startDate ? { startDate: filters.joined_date?.startDate } : {}),
          ...(filters.joined_date?.endDate ? { endDate: filters.joined_date?.endDate } : {}),
          ...(filters.alertTags?.length
            ? { alertTags: filters.alertTags.map(tag => tag.value) }
            : {}),
          ...(isDefined(filters.appointment_count?.min)
            ? { min_apt: filters.appointment_count.min }
            : {}),
          ...(isDefined(filters.appointment_count?.max)
            ? { max_apt: filters.appointment_count.max }
            : {}),
          ...(isDefined(filters.cancelled_appointment_count?.min)
            ? { min_cancel_apt: filters.cancelled_appointment_count.min }
            : {}),
          ...(isDefined(filters.cancelled_appointment_count?.max)
            ? { max_cancel_apt: filters.cancelled_appointment_count.max }
            : {}),
          ...(filters.isFlagged ? { isFlagged: filters.isFlagged.value } : {}),
        }),
      };
      return await axiosPost(`${CLIENT_BASE_PATH}`, { params: queryParams });
    },
    select: res => {
      return {
        data: res.data.data,
        total: res.data.total,
        currentPage: res.data.page,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60,
  });
};

export const useGetClientManagementDetailsQuery = (id: string, enabled = true) => {
  return useQuery({
    queryKey: clientQueryKey.details(id),
    queryFn: async () => {
      return await axiosGet(`${CLIENT_BASE_PATH}/details`, {
        params: {
          id,
        },
      });
    },
    select: res => {
      return res.data;
    },
    placeholderData: keepPreviousData,
    enabled,
  });
};

export const useGetClientManagementTagsQuery = (id: string, type: TagType = TagType.ALERT_TAG) => {
  return useQuery({
    queryKey: [id],
    queryFn: async () => {
      return await axiosGet(`${TAGS_BASE_PATH}/all-tag`, {
        params: {
          id,
          type,
        },
      });
    },
    select: res => ({ assigned: res.data.assigned, unassigned: res.data.unassigned }),
    placeholderData: keepPreviousData,
  });
};

export const useUpdateClientBasicInfo = (id: string) => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (payload: object) => {
      return await axiosPut(`${CLIENT_BASE_PATH}/basic-details/${id}`, {
        data: payload,
        params: {},
      });
    },
    onSuccess: () => {
      invalidate([CLIENT_KEYS_NAME.LIST]);
      invalidate(clientQueryKey.details(id));
      showToast('User Profile Updated Successfully');
    },
    onError: error => {
      console.error('Failed to assign/remove tag:', error);
    },
  });
};

export const useAssignRemoveUserTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: object) => {
      return await axiosPost(`${USER_TAGS_BASE_PATH}/assign-remove`, { data: payload });
    },
    onSuccess: (_, variables: AssignRemoveTagPayload) => {
      queryClient.invalidateQueries([variables.user_id]);
      queryClient.invalidateQueries(clientQueryKey.getList());
    },
    onError: error => {
      console.error('Failed to assign/remove tag:', error);
    },
  });
};

export const useSetClientFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFlag }: SetFlagPayload) => {
      const res = await axiosPost(`${CLIENT_BASE_PATH}/flag`, {
        params: { id },
        data: { isFlag },
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      const allPages = queryClient.getQueriesData({ queryKey: [CLIENT_KEYS_NAME.LIST] });
      let queryKey: (string | object)[] = [];
      for (const currentPage of allPages) {
        if (currentPage[1]?.data?.data.find(i => i.id === variables.id)) {
          queryKey = currentPage[0];
          break;
        }
      }

      if (queryKey) {
        queryClient.setQueriesData(
          { queryKey: [queryKey[0], { page: queryKey[1]?.page }], exact: false },
          oldData => {
            return {
              ...oldData,
              data: {
                ...oldData?.data,
                data: oldData?.data?.data.map(client => {
                  if (client.id === variables.id) {
                    return { ...client, isFlag: variables.isFlag };
                  }
                  return client;
                }),
              },
            };
          }
        );
      }
    },
    onError: error => {
      console.error('Failed to set flag:', error);
    },
  });
};

// Async function for tags with pagination support for CustomAsyncSelect
export const getTagsAsync = async (page?: number, searchTerm?: string) => {
  try {
    const params: Record<string, string | number> = {};
    if (page) {
      params.page = page;
      params.limit = 10;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }

    const response = await axiosGet(TAGS_BASE_PATH, { params });

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
  } catch (e) {
    console.error(`Failed to get tags:`, e);
    return {
      data: [],
      hasMore: false,
    };
  }
};

// Async function for clients with pagination support for CustomAsyncSelect
export const getClientsAsync = async (page?: number, searchTerm?: string) => {
  try {
    const params: Record<string, string | number> = {
      page: page || 1,
      limit: 10,
    };

    if (searchTerm?.trim()) {
      params.search = searchTerm;
    }

    const response = await axiosPost(`${CLIENT_BASE_PATH}/list`, {
      params,
    });

    const clients = response?.data?.data?.data || [];
    const hasMore = response?.data?.data?.hasMore || false;

    const transformedData = clients.map(
      (client: {
        id: string;
        user?: { first_name: string; last_name: string; profile_image?: string };
      }) => {
        return {
          value: client.id,
          label: `${client?.user?.first_name} ${client?.user?.last_name}`,
          image: client?.user?.profile_image,
        };
      }
    );

    return {
      data: transformedData,
      hasMore: hasMore,
    };
  } catch (error) {
    console.error('Failed to get clients:', error);
    return {
      data: [],
      hasMore: false,
    };
  }
};

export const useCreateClientFromDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: object) => {
      return await axiosPost(`${CLIENT_BASE_PATH}/create-client-dashboard`, { data: payload });
    },
    onSuccess: (_, variables: CreateClientData) => {
      queryClient.invalidateQueries({ queryKey: [variables.clientData.email] });
    },
    onError: error => {
      console.error('Failed to create client:', error);
    },
  });
};

export const useDeleteDependent = () => {
  const { invalidate } = useInvalidateQuery();

  return useMutation({
    mutationFn: async (dependentId: string | number) => {
      return await axiosDelete(`${CLIENT_BASE_PATH}/delete-dependent/${dependentId}`, {});
    },
    onSuccess: () => {
      invalidate([CLIENT_KEYS_NAME.LIST]);
    },
    onError: error => {
      console.error('Failed to delete dependent:', error);
    },
  });
};

export const useUpdateClientData = () => {
  const { invalidate } = useInvalidateQuery();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clientId,
      is_long_term_patient,
    }: {
      clientId: string;
      is_long_term_patient: boolean;
    }) => {
      return await axiosPut(`${CLIENT_BASE_PATH}/${clientId}`, {
        data: { is_long_term_patient },
      });
    },
    onSuccess: (_, variables) => {
      invalidate(clientQueryKey.details(variables.clientId));
      queryClient.invalidateQueries({
        queryKey: [USER_KEYS_NAME.THERAPIST_CLIENT_LIST],
        exact: false,
      });
    },
    onError: error => {
      console.error('Failed to update client data:', error);
    },
  });
};
