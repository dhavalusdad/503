export const USER_KEYS_NAME = {
  LIST: 'get-patient-list',
  PROFILE: 'user-profile',
  DETAILS: 'get-user-details',
  COUNTRY: 'get-countries',
  STATE: 'get-state-by-country',
  THERAPIST_CLIENT_LIST: 'therapist-clients',
  PATIENT_WELLNESS_DETAIL: 'patient-wellness-detail',
  PATIENT_WELLNESS: 'patient-wellness',
  CHECK_EMAIL_EXISTS: 'check-email-exists',
};

export const userQueryKey = {
  getPatientList: () => [USER_KEYS_NAME.LIST],
  useGetUserProfile: () => [USER_KEYS_NAME.PROFILE],
  getUserDetails: () => [USER_KEYS_NAME.DETAILS],
  useCheckEmailExists: (email: string) => [USER_KEYS_NAME.CHECK_EMAIL_EXISTS, email],
  getCountries: () => [USER_KEYS_NAME.COUNTRY],
  getStateByCountry: () => [USER_KEYS_NAME.STATE],
  getTherapistClientList: (params: object) => [USER_KEYS_NAME.THERAPIST_CLIENT_LIST, { ...params }],
  getPatientWellnessDetail: () => [USER_KEYS_NAME.PATIENT_WELLNESS_DETAIL],
  getPatientWellness: () => [USER_KEYS_NAME.PATIENT_WELLNESS],
};
