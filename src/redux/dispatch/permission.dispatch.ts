import type { PermissionDataType } from '@/api/types/permissions.dto';
import { setPermissions } from '@/redux/ducks/permissions';
import { store } from '@/redux/store';

export const dispatchSetPermissions = (permissions: PermissionDataType) => {
  store.dispatch(setPermissions(permissions));
};
