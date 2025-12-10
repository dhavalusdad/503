export const PERMISSION_QUERY_KEYS_NAME = {
  GET_USER_PERMISSION: 'permissions',
};

export const PermissionQueryKey = {
  getAllPermission: () => [PERMISSION_QUERY_KEYS_NAME.GET_USER_PERMISSION],
};
