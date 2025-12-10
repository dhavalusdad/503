export const PREFERENCES_KEYS_NAME = {
  GET_PREFERENCES: 'get-preferences',
  PUT_PREFERENCES: 'put_preferences',
};

export const preferenceQueryKey = {
  getPreferences: () => [PREFERENCES_KEYS_NAME.GET_PREFERENCES],
  putPreferences: () => [PREFERENCES_KEYS_NAME.PUT_PREFERENCES],
};
