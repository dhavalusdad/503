import type { OptionType } from '@/api/types/field-option.dto';

export const STATUS_OPTION: OptionType[] = [
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Open', value: 'Open' },
  { label: 'Escalated', value: 'Escalated' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Denied', value: 'Denied' },
];

export const REQUEST_TYPE_OPTION: OptionType[] = [
  { label: 'Cancellation', value: 'Cancellation' },
  { label: 'Profile Change', value: 'Profile Change' },
  { label: 'AMD Form Submission', value: 'AMD Form Submission' },
  { label: 'Insurance Verification Failed', value: 'Insurance Verification Failed' },
];

export enum UpdateQueueRequestDataType {
  STATUS = 'status',
  ASSIGNEE = 'assignee',
  PROFILE = 'profile',
}

export enum QueueRequestProfileChangeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum QUEUE_REQUEST_PROFILE_FIELD_TYPE {
  PROFILE = 'profile',
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
}

export enum TABLE_NAME_ENUM {
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
}

export const QUEUE_REQUEST_FIELD_TYPE_BY_TABLE_NAME = {
  [TABLE_NAME_ENUM.EXPERIENCE]: QUEUE_REQUEST_PROFILE_FIELD_TYPE.EXPERIENCE,
  [TABLE_NAME_ENUM.EDUCATION]: QUEUE_REQUEST_PROFILE_FIELD_TYPE.EDUCATION,
};

export const FIELD_LABELS: Record<string, string> = {
  designation: 'Designation',
  organization: 'Practice at',
  location: 'Location',
  specialty: 'Specialty',
  start_date: 'Start Date',
  end_date: 'End Date',
  currentlyWorking: 'Currently Working',
  institution: 'College/Institution',
  degree: 'Degree',
  specialization: 'Major/Specialization',
  gpa: 'GPA',
  degreeStartDate: 'Start Date',
  degreeEndDate: 'End Date',
};

// specify the field order you want to display
export const FIELD_ORDER = {
  EXPERIENCE: [
    'designation',
    'organization',
    'location',
    'currentlyWorking',
    'start_date',
    'end_date',
    'specialty',
  ],
  EDUCATION: ['institution', 'degree', 'specialization', 'gpa', 'start_date', 'end_date'],
};

export const STATUS_STYLE = {
  [QueueRequestProfileChangeStatus.PENDING]: {
    label: 'Open',
    color: 'text-yellow-500',
  },
  [QueueRequestProfileChangeStatus.APPROVED]: {
    label: 'Approved',
    color: 'text-green-500',
  },
  [QueueRequestProfileChangeStatus.REJECTED]: {
    label: 'Rejected',
    color: 'text-red-500',
  },
};

export enum QUEUE_REQUEST_METADATA_ACTIONS {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export const QUEUE_REQUEST_METADATA_FIELD_NAME = {
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  DOB: 'dob',
  GENDER: 'gender',
  MARITAL_STATUS: 'marital_status',
  PHONE: 'phone',
  BIO: 'bio',
  MIN_PATIENT_AGE: 'min_patient_age',
  MAX_PATIENT_AGE: 'max_patient_age',
  NPI_NUMBER: 'npi_number',
  LANGUAGE: 'languages',
  AREA_OF_FOCUS: 'area_of_focus',
  THERAPY_TYPE: 'therapy_type',
  SESSION_TYPE: 'session_type',
  CLINIC_ADDRESS: 'clinic_address',
  ADDRESS1: 'address1',
  ADDRESS2: 'address2',
  CITY: 'city',
  STATE: 'state',
  POSTAL_CODE: 'postal_code',
  COUNTRY: 'country',
  ADDRESS: 'address',
  EMAIL: 'email',
};
