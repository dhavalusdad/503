export const NOTIFICATION_KEYS_NAME = {
  LIST: 'notifications',
};

export const notificationQueryKeys = {
  list: (status?: string) => [NOTIFICATION_KEYS_NAME.LIST, status],
};
