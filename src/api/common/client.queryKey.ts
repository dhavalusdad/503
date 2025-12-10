import type {
  ClientManagementParamsType,
  GetClientListForAdminRequest,
} from '@/api/types/user.dto';

export const CLIENT_KEYS_NAME = {
  LIST: 'client-list',
  USER_AGREEMENTS: 'user-agreements',
  CLIENT_LIST_FOR_ADMIN: 'client-list-for-admin',
};

export const clientQueryKey = {
  getList: (params?: ClientManagementParamsType) => [CLIENT_KEYS_NAME.LIST, params],
  getUserAgreements: () => [CLIENT_KEYS_NAME.USER_AGREEMENTS],
  details: (id: string) => [CLIENT_KEYS_NAME.LIST, id],
  getClientListForAdmin: (params?: GetClientListForAdminRequest) => [
    CLIENT_KEYS_NAME.CLIENT_LIST_FOR_ADMIN,
    params,
  ],
};
