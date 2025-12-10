export const DEPENDENT_KEYS_NAME = {
  LIST: 'get-dependent-users',
  SINGLE_DEPENDENT: 'get-dependent-user',
};

export const dependentQueryKey = {
  getAllDependentUsers: (params: {
    limit?: number;
    sortColumn?: string;
    sortOrder?: string;
    search?: string;
  }) => [DEPENDENT_KEYS_NAME.LIST, params].filter(item => item !== undefined),

  getDependentById: (user_id: string) => [DEPENDENT_KEYS_NAME.SINGLE_DEPENDENT, user_id],
};
