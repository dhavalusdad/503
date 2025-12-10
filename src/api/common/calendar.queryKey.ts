export const calendarQueryKeys = {
  all: ['calendar'] as const,
  availabilitySlots: (params?: object) =>
    ['calendar', 'availabilitySlots', params].filter(item => item !== undefined),
  appointments: (params?: object) =>
    ['calendar', 'appointments', params].filter(item => item !== undefined),
  appointmentsDetail: (appointmentId?: string) =>
    ['calendar', 'appointments', 'detail', appointmentId].filter(Boolean),
  clientTherapistAppointments: (params?: object) =>
    ['client-therapist-appointments', params].filter(item => item !== undefined),
};
