export const notesOptionsQueryKey = {
  getNotesByAppointment: (
    appointment_id: string,
    note_type: string,
    params?: { sortColumn?: string; sortOrder?: string; search?: string; isDraft?: boolean }
  ) => ['notes', 'appointment', appointment_id, note_type, params].filter(d => d !== undefined),
  // Prefix key without params, useful for broad invalidation/removal across all variants (sort/search)
  // getNotesList: (appointment_id: sstring, note_type: string) =>
  //   ['notes', 'appointment', appointment_id, note_type] as const,
  getNoteById: (id: string | undefined) => ['getNoteById', id].filter(item => item !== undefined),
  getLastNoteByClientAndTherapistId: () =>
    ['getLastNoteByClientAndTherapistId'].filter(item => item !== undefined),
};
