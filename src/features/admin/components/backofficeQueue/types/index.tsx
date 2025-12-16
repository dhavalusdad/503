import * as yup from 'yup';

import type { OptionType } from '@/api/types/field-option.dto';
import type { DateRangeFilterObjType } from '@/components/layout/Filter/types';
import type { QueueRequestType } from '@/enums';
import type {
  QUEUE_REQUEST_METADATA_ACTIONS,
  QueueRequestProfileChangeStatus,
  TABLE_NAME_ENUM,
} from '@/features/admin/components/backofficeQueue/constant';

export type QueueDataType = {
  id: string;
  request_type: QueueRequestType;
  status: string;
  tags: string[] | null[];
  created_at: Date | null;
  updated_at: Date | null;
  assigned_to_first_name: string;
  assigned_to_last_name: string;
  assigned_to_role: string;
  requester_first_name: string;
  requester_last_name: string;
  requester_role: string;
  requester: {
    first_name: string;
    last_name: string;
    roles: [
      {
        id: string;
        name: string;
      },
    ];
  };
  assignee: {
    first_name: string;
    last_name: string;
    roles: [
      {
        id: string;
        name: string;
      },
    ];
  };
  assigned_to_id?: string | null;
  metadata: {
    is_system_generated?: boolean;
  };
};

export type QueueFilterDataType = {
  created_at?: DateRangeFilterObjType;
  status?: OptionType[];
  request_type?: OptionType[];
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
  assigned_to_role?: OptionType[];
};

export type StatusTags = {
  value: string;
  label: string;
  color: string;
};

export type ModalType = {
  modal: string;
  escalate?: boolean;
  resolve?: boolean;
  denied?: boolean;
  transferTo?: boolean;
  status: keyof Omit<ModalType, 'modal' | 'status' | 'queue_id' | 'role'>;
  queue_id?: string;
  role?: string;
};

export type AuditLog = {
  id: string;
  updated_by: string;
  comment: string;
  prev_status: string;
  next_status: string;

  created_at: Date | null;
  updated_at: Date | null;
  user_info: {
    first_name?: string;
    last_name?: string;
    profile_image: string;
  };
  audit_trail_uploads: [
    {
      id: string;
      audit_trail_id: string;
      image_path: string;
    },
  ];
  requester: {
    id: string;
    first_name: string;
    last_name: string;
    roles: [
      {
        id: string;
        name: string;
      },
    ];
  };
};

export const AuditTrialSchema = yup.object().shape({
  comment: yup
    .string()
    .nullable()
    .optional()
    .max(500, 'Comment must be at most 500 characters long'),
});

export type QueueRequestDetailFormData = {
  comment: string;
};
export type FileItem = {
  id: string;
  image_path?: string;
  file?: File;
  name?: string;
};

export type DisplayFieldProps = {
  label?: string;
  value?: string | number | null;
};

export type ExperienceValueType = {
  end_year: number | null;
  location: string | null;
  end_month: number | null;
  specialty: string | null;
  start_year: number | null;
  designation: string | null;
  start_month: number | null;
  organization: string | null;
};

export type EducationValue = {
  institution: string | null;
  degree: string | null;
  specialization: string | null;
  gpa: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type TableDataChange = {
  id?: string;
  status: string;
  old_value: ExperienceValueType | EducationValue | null;
  new_value: ExperienceValueType | EducationValue | null;
  action: QUEUE_REQUEST_METADATA_ACTIONS;
};

export type TransformedField = {
  label: string;
  old_value: string;
  new_value: string;
};

export type THERAPIST_BIO_METADATA_TYPE = {
  id: string;
  action?: QUEUE_REQUEST_METADATA_ACTIONS;
  status: QueueRequestProfileChangeStatus;
  old_value: { [key: string]: string } | string;
  new_value: { [key: string]: string } | string;
  field_name: string;
};

export type TableNamesType = TABLE_NAME_ENUM.EXPERIENCE | TABLE_NAME_ENUM.EDUCATION;
