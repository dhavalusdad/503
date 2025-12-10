export interface PreferenceData {
  id: string;
  user_id: string;
  tenant_id: string;
  role_id: string;
  timezone: string;
  email_notifications_enabled: boolean;
  text_notifications_enabled: boolean;
  chat_notifications_enabled: boolean | null;
  marketing_notifications_enabled: boolean | null;
  video_call_waiting_notifications_enabled: boolean | null;
  real_time_notifications_enabled: boolean | null;
  chat_unread_email_reminder_enabled: boolean | null;
  is_active: boolean;
}

export type UpdatePreferencePayload = {
  key: string;
  value: boolean;
};
