import type { IconNameType } from '@/stories/Common/Icon';

export enum NotificationReadStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

export enum NotificationCategory {
  CHAT = 'CHAT',
  APPOINTMENT = 'APPOINTMENT',
  SLOT_REQUEST = 'SLOT_REQUEST',
  SESSION_REMINDER = 'SESSION_REMINDER',
  WAITING_ROOM = 'WAITING_ROOM',
  SYSTEM = 'SYSTEM',
  FORM_ASSIGNMENT = 'FORM_ASSIGNMENT',
  INSURANCE = 'INSURANCE',
  BACKOFFICE_QUEUE = 'BACKOFFICE_QUEUE',
}

export enum NotificationEvent {
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  SESSION_REMINDER = 'SESSION_REMINDER',
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  SLOT_REQUEST = 'SLOT_REQUEST',
  WAITING_ROOM = 'WAITING_ROOM',
  NEW_CLIENT_JOINED = 'NEW_CLIENT_JOINED',
  NEW_THERAPIST_JOINED = 'NEW_THERAPIST_JOINED',
  APPOINTMENT_NO_SHOW = 'APPOINTMENT_NO_SHOW',
}

export interface NotificationMetadataType {
  start_time?: string | Date;
  end_time?: string | Date;

  initiator_id?: string | number;
  all_future?: boolean;

  session_link?: string;
  sessionId?: string; // used in CHAT notifications

  preferred_time?: string | Date;

  room_id?: string;

  form_count?: number;
  form_ids?: string[];
  appointment_ids?: string[];

  failed_carriers?: {
    carrier_name: string;
    reason: string;
  }[];

  queue_id?: string;

  visual?: {
    type: 'profile' | 'icon';
    iconName?: IconNameType;
    className?: string;
  };

  navigateTo?: string;
  external?: boolean;
}

export interface NotificationItemType {
  id: string;
  tenant_id: string;
  user_id: string;
  recipient_role_id: string;
  sender_id: string;
  category: NotificationCategory;
  event: string;
  title: string;
  message: string;
  status: NotificationReadStatus;
  metadata: NotificationMetadataType;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  sender: Sender;
}

export interface Sender {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_image: string;
}
