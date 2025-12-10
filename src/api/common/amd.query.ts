export const amdFormQueryKeys = {
  all: ['amd-form'] as const,
  form: (appointmentId: string) => [...amdFormQueryKeys.all, 'form', appointmentId] as const,
  unsignedForms: (
    client_id: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortColumn?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) => [...amdFormQueryKeys.all, 'unsigned-forms', client_id, params] as const,
  infiniteUnsignedForms: (therapistId: string, appointmentId?: string, statusKey?: string) =>
    [
      ...amdFormQueryKeys.all,
      'infinite-unsigned-forms',
      therapistId,
      appointmentId,
      statusKey,
    ] as const,
  formValue: (visitId: string) => [...amdFormQueryKeys.all, 'form-value', visitId] as const,
  allForms: () => [...amdFormQueryKeys.all, 'get-all'] as const,
  problemList: (clientId?: string, appointmentId?: string) =>
    [...amdFormQueryKeys.all, 'problem-list', clientId, appointmentId] as const,
};
