export const rolePermissionsQueryKey = {
  getRolePermissionList: (params?: object) =>
    ['getRolePermissionList', params].filter(item => item !== undefined),
  getByRoleId: (role_id?: string) => ['permissions', role_id],
  getPermissionsList: () => ['permissions'],
};
