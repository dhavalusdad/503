export enum GenderEnum {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum MaritalStatusEnum {
  SINGLE = 'Single',
  MARRIED = 'Married',
  COMMON_LAW = 'Common Law',
  DOMESTIC_PARTNERSHIP = 'Domestic Partnership',
}

export enum OtpType {
  LOGIN = 'login',
  FORGOT_PASSWORD = 'forgot_password',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFY = 'email_verify',
}

export enum FieldOptionType {
  AREA_OF_FOCUS = 'AreaOfFocus',
  PAYMENT_METHOD = 'PaymentMethod',
  THERAPY_TYPE = 'TherapyType',
  WIDGET_TYPE = 'WidgetType',
  SESSION_TYPE = 'SessionType',
  CARRIER_NAME = 'CarrierName',
  DEGREE = 'Degree',
}

export enum RelationEnum {
  FAMILY = 'Family',
  COUPLE = 'Couple',
  MINOR = 'Minor',
}

export enum ActiveStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  Rescheduled = 'Rescheduled',
  NO_SHOW = 'NoShow',
}
export enum SessionType {
  VIRTUAL = 'Virtual',
  CLINIC = 'Clinic',
}

export enum TherapyType {
  INDIVIDUAL = 'Individual Therapy',
  FAMILY = 'Family Therapy',
  COUPLE = 'Couples Therapy',
  MINOR = 'Minor Therapy',
  ALL = 'ALL',
}

export enum QueueStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  ESCALATED = 'Escalated',
  RESOLVED = 'Resolved',
  DENIED = 'Denied',
}

export enum QueueRequestType {
  APPOINTMENT_CANCEL = 'appointment_cancel',
  THERAPIST_MISSING_NOTE = 'therapist_missing_note',
  CHANGE_THERAPIST_REQUEST = 'change_therapist_request',
  THERAPIST_PROFILE_CHANGE = 'therapist_profile_change',
  MISSING_SESSION_NOTE = 'missing_session_note',
  INSURANCE_VERIFICATION_FAILED = 'insurance_verification_failed',
  INCOMPLETE_CLIENT_PROFILE = 'incomplete_client_profile',
}

export enum NoteType {
  PreAppointment = 'PreAppointment',
  PostAppointment = 'PostAppointment',
  DuringAppointment = 'DuringAppointment',
}

export enum PermissionType {
  // Appointment
  APPOINTMENT_ADD = 'APPOINTMENT_PERMISSION_CREATE',
  APPOINTMENT_VIEW = 'APPOINTMENT_PERMISSION_READ',
  APPOINTMENT_EDIT = 'APPOINTMENT_PERMISSION_UPDATE',

  // Patient
  PATIENT_ADD = 'PATIENT_PERMISSION_CREATE',
  PATIENT_VIEW = 'PATIENT_PERMISSION_READ',
  PATIENT_EDIT = 'PATIENT_PERMISSION_UPDATE',
  PATIENT_ASSIGN_FORM = 'ASSIGN_FORM_TO_PATIENT_PERMISSION_UPDATE',

  // Therapist
  THERAPIST_VIEW = 'THERAPIST_PERMISSION_READ',
  THERAPIST_EDIT = 'THERAPIST_PERMISSION_UPDATE',

  // Assessment Forms
  ASSESSMENT_FORM_VIEW = 'FORMS_PERMISSION_READ',
  ASSESSMENT_FORM_EDIT = 'FORMS_PERMISSION_UPDATE',

  // Agreements
  AGREEMENTS_VIEW = 'AGREEMENTS_PERMISSION_READ',
  AGREEMENTS_ADD = 'AGREEMENTS_PERMISSION_CREATE',
  AGREEMENTS_EDIT = 'AGREEMENTS_PERMISSION_UPDATE',

  // Alert Tags
  ALERT_TAGS_ADD = 'ALERT_TAGS_PERMISSION_CREATE',
  ALERT_TAGS_VIEW = 'ALERT_TAGS_PERMISSION_READ',
  ALERT_TAGS_EDIT = 'ALERT_TAGS_PERMISSION_UPDATE',
  ALERT_TAGS_DELETE = 'ALERT_TAGS_PERMISSION_DELETE',

  // Area of Focus
  AREA_OF_FOCUS_ADD = 'AREA_OF_FOCUS_PERMISSION_CREATE',
  AREA_OF_FOCUS_VIEW = 'AREA_OF_FOCUS_PERMISSION_READ',
  AREA_OF_FOCUS_EDIT = 'AREA_OF_FOCUS_PERMISSION_UPDATE',
  AREA_OF_FOCUS_DELETE = 'AREA_OF_FOCUS_PERMISSION_DELETE',

  // Backoffice Queue
  BACKOFFICE_QUEUE_VIEW = 'BACKOFFICE_QUEUE_PERMISSION_READ',
  BACKOFFICE_QUEUE_EDIT = 'BACKOFFICE_QUEUE_PERMISSION_UPDATE',

  // Clinic Addresses
  CLINIC_ADDRESSES_ADD = 'CLINIC_ADDRESSES_PERMISSION_CREATE',
  CLINIC_ADDRESSES_VIEW = 'CLINIC_ADDRESSES_PERMISSION_READ',
  CLINIC_ADDRESSES_EDIT = 'CLINIC_ADDRESSES_PERMISSION_UPDATE',
  CLINIC_ADDRESSES_DELETE = 'CLINIC_ADDRESSES_PERMISSION_DELETE',

  // Session Tags
  SESSION_TAGS_ADD = 'SESSION_TAGS_PERMISSION_CREATE',
  SESSION_TAGS_VIEW = 'SESSION_TAGS_PERMISSION_READ',
  SESSION_TAGS_EDIT = 'SESSION_TAGS_PERMISSION_UPDATE',
  SESSION_TAGS_DELETE = 'SESSION_TAGS_PERMISSION_DELETE',

  // Widgets
  WIDGETS_ADD = 'WIDGETS_PERMISSION_CREATE',
  WIDGETS_VIEW = 'WIDGETS_PERMISSION_READ',
  WIDGETS_EDIT = 'WIDGETS_PERMISSION_UPDATE',
  WIDGETS_DELETE = 'WIDGETS_PERMISSION_DELETE',

  // Third Party Logs
  THIRD_PARTY_LOGS_VIEW = 'THIRD_PARTY_LOGS_PERMISSION_READ',
  THIRD_PARTY_LOGS_RETRY = 'THIRD_PARTY_LOGS_PERMISSION_RETRY',

  // Transactions
  TRANSACTIONS_VIEW = 'TRANSACTIONS_PERMISSION_READ',
  TRANSACTIONS_UPDATE = 'TRANSACTIONS_PERMISSION_UPDATE',

  // Appointment Types
  APPOINTMENT_TYPES_VIEW = 'APPOINTMENT_TYPES_PERMISSION_READ',
  APPOINTMENT_TYPES_SYNC = 'APPOINTMENT_TYPES_PERMISSION_SYNC',
}

export enum AssessmentFormType {
  ONE_TIME = 'OneTime',
  PER_APPOINTMENT = 'PerAppointment',
  PER_SESSION = 'PerSession',
  CUSTOM = 'Custom',
}

export enum QuestionTypeEnum {
  SHORT_ANSWER = 'ShortAnswer',
  MULTIPLE_CHOICE = 'MultipleChoice',
  CHECKBOX = 'CheckBox',
  RATING = 'Rating',
  RADIO = 'Radio',
  FILE_UPLOAD = 'FileUpload',
  SINGLE_CHOICE = 'SingleChoice',
  LONG_ANSWER = 'LongAnswer',
  DATE_PICKER = 'Date',
  NUMERIC_INPUT = 'NumericInput',
  PHONE_NUMBER = 'PhoneInput',

  // Informative Parts
  TEXT_HEADER = 'TextHeader',
  BULLET_POINTS = 'BulletPoints',
}

export enum TagType {
  SESSION_TAG = 'session_tag',
  ALERT_TAG = 'alert_tag',
}

export enum FormStatusType {
  SUBMITTED = 'Submitted',
  PENDING = 'Pending',
  SIGNED = 'Signed',
}

export enum FormCategory {
  REQUIRED = 'Required',
  OPTIONAL = 'Optional',
}

export enum LoginRequestEnum {
  INVITE = 'invite',
}

export enum TransactionStatus {
  SUCCESS = 'Success',
  FAILED = 'Failed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
  VOID = 'Void',
}
export enum TransactionType {
  CHARGE = 'Charge',
  REFUND = 'Refund',
  VOID = 'Void',
}

export enum PaymentMethodEnum {
  Insurance = 'Insurance',
  SelfPay = 'Self Pay',
}

export enum TransactionAction {
  DECLINE = 'decline',
  APPROVE = 'approve',
}

export enum AmdFormDocNames {
  DISCHARGE_SUMMARY = 'Discharge Summary',
  CHILD_ADOL_INTAKE = 'Child/Adol Intake 10.28.24',
  ADULT_INTAKE = 'Adult Intake 10.28.24',
  CHILD_ADOL_PROG_NOTE_FOLLOW_UP = 'New Child/Adol Prog Note Follow UP 12.18',
  ADULT_PROG_NOTE_FOLLOW_UP = 'New Adult Prog Note Follow Up 12.18.23',
  SAFETY_PLAN = 'Safety Plan',
}

export enum PERMISSION_OPERATOR {
  AND = 'AND',
  OR = 'OR',
}
