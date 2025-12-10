export const STATE_KEYS_NAME = {
  LIST: 'states',
  BY_COUNTRY: 'states-by-country',
  BY_ID: 'state-by-id',
  ALL_CREDENTIALED: 'credentialed-states-all',
};

export const stateQueryKey = {
  getStatesKey: (params?: object) =>
    [STATE_KEYS_NAME.LIST, params].filter(value => value != undefined),
  getStatesByCountryKey: (countryId: string) => [STATE_KEYS_NAME.BY_COUNTRY, countryId],
  getStateByIdKey: (id?: string) => [STATE_KEYS_NAME.BY_ID, id],
  getAllCredentialedStatesKey: (isCredentialed?: boolean) => [
    STATE_KEYS_NAME.ALL_CREDENTIALED,
    isCredentialed,
  ],
};
