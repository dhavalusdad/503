import { PermissionType } from '@/enums';

export const DEPENDENT_PERMISSIONS: Record<
  PermissionType,
  { allow?: PermissionType[]; deny?: PermissionType[] }
> = {
  [PermissionType.PATIENT_ASSIGN_FORM]: {
    allow: [PermissionType.ASSESSMENT_FORM_VIEW, PermissionType.PATIENT_VIEW],
  },
  [PermissionType.ASSESSMENT_FORM_VIEW]: {
    deny: [PermissionType.ASSESSMENT_FORM_EDIT],
  },
  [PermissionType.ASSESSMENT_FORM_EDIT]: {
    allow: [PermissionType.ASSESSMENT_FORM_VIEW],
  },
  [PermissionType.APPOINTMENT_ADD]: {
    allow: [
      PermissionType.PATIENT_VIEW,
      PermissionType.PATIENT_EDIT,
      PermissionType.THERAPIST_VIEW,
      PermissionType.AREA_OF_FOCUS_VIEW,
      PermissionType.APPOINTMENT_TYPES_VIEW,
      PermissionType.CLINIC_ADDRESSES_VIEW,
      PermissionType.APPOINTMENT_VIEW,
    ],
  },
  [PermissionType.APPOINTMENT_VIEW]: {
    allow: [
      PermissionType.TRANSACTIONS_VIEW,
      PermissionType.THERAPIST_VIEW,
      PermissionType.PATIENT_VIEW,
    ],
    deny: [PermissionType.APPOINTMENT_ADD, PermissionType.APPOINTMENT_EDIT],
  },
  [PermissionType.APPOINTMENT_EDIT]: {
    allow: [PermissionType.APPOINTMENT_VIEW, PermissionType.THERAPIST_VIEW],
  },
  [PermissionType.PATIENT_ADD]: {
    allow: [PermissionType.PATIENT_VIEW],
  },
  [PermissionType.PATIENT_VIEW]: {
    allow: [
      PermissionType.APPOINTMENT_VIEW,
      PermissionType.ASSESSMENT_FORM_VIEW,
      PermissionType.AGREEMENTS_VIEW,
    ],
    deny: [PermissionType.PATIENT_ADD, PermissionType.PATIENT_EDIT],
  },
  [PermissionType.PATIENT_EDIT]: {
    allow: [PermissionType.PATIENT_VIEW],
  },
  [PermissionType.THERAPIST_VIEW]: {
    allow: [PermissionType.AREA_OF_FOCUS_VIEW],
    deny: [PermissionType.THERAPIST_EDIT],
  },
  [PermissionType.THERAPIST_EDIT]: {
    allow: [
      PermissionType.THERAPIST_VIEW,
      PermissionType.CLINIC_ADDRESSES_VIEW,
      PermissionType.AREA_OF_FOCUS_VIEW,
    ],
  },
  [PermissionType.AGREEMENTS_ADD]: {
    allow: [PermissionType.AGREEMENTS_VIEW],
  },
  [PermissionType.AGREEMENTS_EDIT]: {
    allow: [PermissionType.AGREEMENTS_VIEW],
  },
  [PermissionType.AGREEMENTS_VIEW]: {
    deny: [PermissionType.AGREEMENTS_ADD, PermissionType.AGREEMENTS_EDIT],
  },
  [PermissionType.AREA_OF_FOCUS_ADD]: {
    allow: [PermissionType.AREA_OF_FOCUS_VIEW],
  },
  [PermissionType.AREA_OF_FOCUS_VIEW]: {
    deny: [
      PermissionType.AREA_OF_FOCUS_ADD,
      PermissionType.AREA_OF_FOCUS_EDIT,
      PermissionType.AREA_OF_FOCUS_DELETE,
    ],
  },
  [PermissionType.AREA_OF_FOCUS_EDIT]: {
    allow: [PermissionType.AREA_OF_FOCUS_VIEW],
  },
  [PermissionType.AREA_OF_FOCUS_DELETE]: {
    allow: [PermissionType.AREA_OF_FOCUS_VIEW],
  },
  [PermissionType.WIDGETS_ADD]: {
    allow: [PermissionType.WIDGETS_VIEW],
  },
  [PermissionType.WIDGETS_VIEW]: {
    deny: [PermissionType.WIDGETS_ADD, PermissionType.WIDGETS_EDIT, PermissionType.WIDGETS_DELETE],
  },
  [PermissionType.WIDGETS_EDIT]: {
    allow: [PermissionType.WIDGETS_VIEW],
  },
  [PermissionType.WIDGETS_DELETE]: {
    allow: [PermissionType.WIDGETS_VIEW],
  },
  [PermissionType.ALERT_TAGS_ADD]: {
    allow: [PermissionType.ALERT_TAGS_VIEW],
  },
  [PermissionType.ALERT_TAGS_VIEW]: {
    deny: [
      PermissionType.ALERT_TAGS_ADD,
      PermissionType.ALERT_TAGS_EDIT,
      PermissionType.ALERT_TAGS_DELETE,
    ],
  },
  [PermissionType.ALERT_TAGS_EDIT]: {
    allow: [PermissionType.ALERT_TAGS_VIEW],
  },
  [PermissionType.ALERT_TAGS_DELETE]: {
    allow: [PermissionType.ALERT_TAGS_VIEW],
  },
  [PermissionType.SESSION_TAGS_ADD]: {
    allow: [PermissionType.SESSION_TAGS_VIEW],
  },
  [PermissionType.SESSION_TAGS_VIEW]: {
    deny: [
      PermissionType.SESSION_TAGS_ADD,
      PermissionType.SESSION_TAGS_EDIT,
      PermissionType.SESSION_TAGS_DELETE,
    ],
  },
  [PermissionType.SESSION_TAGS_EDIT]: {
    allow: [PermissionType.SESSION_TAGS_VIEW],
  },
  [PermissionType.SESSION_TAGS_DELETE]: {
    allow: [PermissionType.SESSION_TAGS_VIEW],
  },
  [PermissionType.CLINIC_ADDRESSES_ADD]: {
    allow: [PermissionType.CLINIC_ADDRESSES_VIEW],
  },
  [PermissionType.CLINIC_ADDRESSES_VIEW]: {
    deny: [
      PermissionType.CLINIC_ADDRESSES_ADD,
      PermissionType.CLINIC_ADDRESSES_EDIT,
      PermissionType.CLINIC_ADDRESSES_DELETE,
    ],
  },
  [PermissionType.CLINIC_ADDRESSES_EDIT]: {
    allow: [PermissionType.CLINIC_ADDRESSES_VIEW],
  },
  [PermissionType.CLINIC_ADDRESSES_DELETE]: {
    allow: [PermissionType.CLINIC_ADDRESSES_VIEW],
  },
  [PermissionType.BACKOFFICE_QUEUE_VIEW]: {
    deny: [PermissionType.BACKOFFICE_QUEUE_EDIT],
  },
  [PermissionType.BACKOFFICE_QUEUE_EDIT]: {
    allow: [PermissionType.BACKOFFICE_QUEUE_VIEW],
  },
  [PermissionType.THIRD_PARTY_LOGS_VIEW]: {
    allow: [PermissionType.PATIENT_VIEW, PermissionType.THERAPIST_VIEW],
    deny: [PermissionType.THIRD_PARTY_LOGS_RETRY],
  },
  [PermissionType.THIRD_PARTY_LOGS_RETRY]: {
    allow: [PermissionType.THIRD_PARTY_LOGS_VIEW],
  },
  [PermissionType.TRANSACTIONS_VIEW]: {
    allow: [PermissionType.PATIENT_VIEW, PermissionType.APPOINTMENT_VIEW],
    deny: [PermissionType.TRANSACTIONS_UPDATE],
  },
  [PermissionType.TRANSACTIONS_UPDATE]: {
    allow: [PermissionType.TRANSACTIONS_VIEW],
  },
  [PermissionType.APPOINTMENT_TYPES_VIEW]: {
    deny: [PermissionType.APPOINTMENT_TYPES_SYNC],
  },
  [PermissionType.APPOINTMENT_TYPES_SYNC]: {
    allow: [PermissionType.APPOINTMENT_TYPES_VIEW],
  },
};
