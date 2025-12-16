import { combineReducers } from 'redux';

import { PERMISSION_QUERY_KEYS_NAME } from '@/api/common/permissions.queryKey';
import { useRemoveQueries } from '@/hooks/data-fetching';
import appointmentFiltersReducer from '@/redux/ducks/appointment-filters';
import permissionReducer from '@/redux/ducks/permissions';
import tourReducer from '@/redux/ducks/tour';
import userReducer from '@/redux/ducks/user';
import videoCallReducer from '@/redux/ducks/videoCall';

type Action = {
  type: string;
  payload?: unknown;
};

const appReducer = combineReducers({
  user: userReducer,
  videoCall: videoCallReducer,
  appointmentFilters: appointmentFiltersReducer,
  permissions: permissionReducer,
  tour: tourReducer,
});

export type RootState = ReturnType<typeof appReducer> | undefined;

const rootReducer = (state: RootState, action: Action) => {
  if (action.type === 'LOGOUT') {
    const { removeQuery } = useRemoveQueries();
    state = undefined;
    removeQuery([PERMISSION_QUERY_KEYS_NAME.GET_USER_PERMISSION]);
  }
  return appReducer(state, action);
};

export default rootReducer;
