export const ADMIN_KEYS_NAME = {
  BASIC_DETAILS: 'admin-basic-details',
  DASHBOARD_DATA: 'admin-dashboard-data',
  UPCOMING_SESSIONS: 'admin-dashboard-upcoming-sessions',
  FORM_COMPLETION_RATE: 'form-completion-rate',
};

export const adminQueryKey = {
  getBasicDetailsKey: () => [ADMIN_KEYS_NAME.BASIC_DETAILS],
  getDashboardData: () => [ADMIN_KEYS_NAME.DASHBOARD_DATA],
  getTherapistStatus: (params?: {
    sortColumn?: string;
    sortOrder?: string;
    search?: string;
    isDraft?: boolean;
  }) => [params].filter(d => d !== undefined),
  getDashboardUpcomingSessions: (params: { selectedDate: Date }) => [
    ADMIN_KEYS_NAME.UPCOMING_SESSIONS,
    params,
  ],
  getFormCompletionRate: () => [ADMIN_KEYS_NAME.FORM_COMPLETION_RATE],
};
