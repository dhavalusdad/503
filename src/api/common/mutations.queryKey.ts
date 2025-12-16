export const mutationsQueryKey = {
  createNote: (params?: string) => ['createNote', params].filter(d => d !== undefined),
  updateNote: (params?: string) => ['updateNote', params].filter(d => d !== undefined),
  createFieldOptions: (params?: string) =>
    ['createFieldOptions', params].filter(d => d !== undefined),
  updateFieldOptions: (params?: string) =>
    ['updateFieldOptions', params].filter(d => d !== undefined),
  deleteFieldOptions: (params?: string) =>
    ['deleteFieldOptions', params].filter(d => d !== undefined),
  createRole: (params?: string) => ['createRole', params].filter(d => d !== undefined),
  cancelAppointment: (params?: string) =>
    ['cancel-appointment', params].filter(d => d !== undefined),
  createWellness: (params?: string) => ['createWellness', params].filter(d => d !== undefined),
  createTherapyGoals: (params?: string) =>
    ['createTherapyGoals', params].filter(d => d !== undefined),
  updateTherapyGoals: (params?: string) =>
    ['updateTherapyGoals', params].filter(d => d !== undefined),
  deleteTherapyGoal: (params?: string) =>
    ['deleteTherapyGoals', params].filter(d => d !== undefined),
  createTag: (params?: string) => ['createTag', params].filter(d => d !== undefined),
  updateTag: (params?: string) => ['updateTag', params].filter(d => d !== undefined),
  createAgreement: (params?: string) => ['createAgreement', params].filter(d => d !== undefined),
  updateAgreement: (params?: string) => ['updateAgreement', params].filter(d => d !== undefined),
  deleteAgreement: (params?: string) => ['deleteAgreement', params].filter(d => d !== undefined),
  toggleAgreement: (params?: string) => ['toggleAgreement', params].filter(d => d !== undefined),
  assignAndRemoveReminderWidget: (params?: string) =>
    ['assignAndRemoveReminderWidget', params].filter(d => d !== undefined),
  assignAndRemoveSessionTag: (params?: string) =>
    ['assignAndRemoveSessionTag', params].filter(d => d !== undefined),
  deleteClinicAddress: (params?: string) =>
    ['deleteClinicAddress', params].filter(d => d !== undefined),
  sendMailToDependent: (params?: string) =>
    ['sendMailToDependent', params].filter(d => d !== undefined),
  sendTransactionApproval: (params?: string) =>
    ['sendTransactionApproval', params].filter(d => d !== undefined),
  createAmdEhrForm: (params?: string) => ['createAmdEhrForm', params].filter(d => d !== undefined),
  revertTransaction: (params?: string) =>
    ['revertTransaction', params].filter(d => d !== undefined),
};
