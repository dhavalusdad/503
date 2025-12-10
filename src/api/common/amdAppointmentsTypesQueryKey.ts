export const amdAppointmentsTypesQueryKey = {
  getAmdAppointmentsTypes: (params?: object) =>
    ['get-amd-appointments-types', params].filter(item => item !== undefined),
  syncAmdAppointmentsTypes: (params?: object) =>
    ['sync-amd-appointments-types', params].filter(item => item !== undefined),

  getAmdAppointmentClientPayment: (params?: object) =>
    ['getAmdAppointmentClientPayment', params].filter(item => item !== undefined),
  getAmdEhrForm: (id?: string) => ['getAmdEhrForm', id].filter(item => item !== undefined),
};
