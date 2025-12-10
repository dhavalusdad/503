export const INSURANCE_KEYS_NAME = {
  CLIENT_INSURANCES: 'client-insurances',
  ALL_INSURANCES: 'all-insurances',
  INSURANCES_NOT_IN_APPOINTMENT: 'insurances-not-in-appointment',
  USER_INSURANCE_STATUS: 'user-insurance-status',
};

export const insuranceQueryKey = {
  getClientInsurances: (clientId?: string) => [INSURANCE_KEYS_NAME.CLIENT_INSURANCES, clientId],
  getAllInsurances: () => [INSURANCE_KEYS_NAME.ALL_INSURANCES],
  getInsurancesNotInAppointment: (appointmentId?: string) => [
    INSURANCE_KEYS_NAME.INSURANCES_NOT_IN_APPOINTMENT,
    appointmentId,
  ],
  getUserInsuranceStatus: () => [INSURANCE_KEYS_NAME.USER_INSURANCE_STATUS],
};
