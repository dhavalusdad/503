import type { TherapistOptionsParamsType } from '@/api/types/therapist.dto';

export const ROLES_KEYS_NAME = {
  OPTIONS: 'roles',
};

export const rolesQueryKey = {
  infiniteRoles: (limit: number, roleName?: string) =>
    ['infinite-roles', limit, roleName].filter(d => d !== undefined),
  getRoleOptions: (params: TherapistOptionsParamsType) => [ROLES_KEYS_NAME.OPTIONS, params],
};
