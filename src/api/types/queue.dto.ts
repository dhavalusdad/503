import type {
  QUEUE_REQUEST_PROFILE_FIELD_TYPE,
  UpdateQueueRequestDataType,
} from '@/features/admin/components/backofficeQueue/constant';

export interface UpdateQueueRequest {
  queue_id?: string;
  status?: string;
  comment?: string;
  docs?: string[] | File[] | null;
  assigned_to_id?: string;
  action?: string;
  field?: string;
  type: UpdateQueueRequestDataType;
  field_type: QUEUE_REQUEST_PROFILE_FIELD_TYPE;
}
