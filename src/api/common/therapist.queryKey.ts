import type {
  GetClientListForAdminRequest,
  TherapistListParamsType,
  TherapistOptionsParamsType,
} from '../types';

export const THERAPIST_KEYS_NAME = {
  LIST: 'therapist-list',
  BASIC_DETAILS: 'therapist-basic-details',
  EXPERIENCE: 'therapist-experience',
  ALL_EXPERIENCE: 'therapist-experiences',
  DETAILS: 'therapist-details',
  OPTIONS: 'therapist-details',
  client_session_progress: 'client-session-progress',
  SESSION_ENGAGEMENT: 'session-engagement',
  THERAPIST_LIST_FOR_ADMIN: 'therapist-list-for-admin',
  EDUCATION: 'therapist-education',
  ALL_EDUCATION: 'therapist-educations',
  CLINICS_LIST: 'clinic-list',
};

export const therapistQueryKey = {
  getBasicDetailsKey: () => [THERAPIST_KEYS_NAME.BASIC_DETAILS],
  getBasicDetailsInfoKey: (therapist_id?: string) => [
    THERAPIST_KEYS_NAME.BASIC_DETAILS,
    therapist_id,
  ],
  getTherapistExperience: (params: { experience_id: string; therapist_id?: string }) => {
    const { experience_id, therapist_id } = params;
    return [THERAPIST_KEYS_NAME.EXPERIENCE, experience_id, therapist_id];
  },
  getTherapistAllExperience: (therapist_id?: string) => [
    THERAPIST_KEYS_NAME.ALL_EXPERIENCE,
    therapist_id,
  ],
  getTherapistList: (params: TherapistListParamsType) => [THERAPIST_KEYS_NAME.LIST, params],
  getDetailsKey: (id: string) => [THERAPIST_KEYS_NAME.DETAILS, id],
  getTherapistOptions: (params: TherapistOptionsParamsType) => [
    THERAPIST_KEYS_NAME.OPTIONS,
    params,
  ],
  getClientSessionProgress: () => [THERAPIST_KEYS_NAME.client_session_progress],
  getTherapistSessionEngagement: () => [THERAPIST_KEYS_NAME.SESSION_ENGAGEMENT],
  getTherapistListForAdmin: (params?: GetClientListForAdminRequest) => [
    THERAPIST_KEYS_NAME.THERAPIST_LIST_FOR_ADMIN,
    params,
  ],
  getTherapistEducation: (params: { education_id: string; therapist_id?: string }) => {
    const { education_id, therapist_id } = params;
    return [THERAPIST_KEYS_NAME.EDUCATION, education_id, therapist_id];
  },
  getTherapistAllEducation: (therapist_id?: string) => [
    THERAPIST_KEYS_NAME.ALL_EDUCATION,
    therapist_id,
  ],
  getTherapistClinic: (therapist_id: string) => [THERAPIST_KEYS_NAME.CLINICS_LIST, therapist_id],
};
