import moment from 'moment-timezone';

import {
  ActiveStatusEnum,
  AppointmentStatus,
  GenderEnum,
  MaritalStatusEnum,
  SessionType,
  TherapyType,
  QueueStatus,
  AssessmentFormType,
  QuestionTypeEnum,
  FormStatusType,
  FormCategory,
} from '@/enums';
// generateYears function moved here to avoid circular dependency
const generateYears = (start = 1940, end = new Date().getFullYear()) => {
  const years = [];
  for (let year = start; year <= end; year++) {
    years.push({ label: year.toString(), value: year });
  }
  return years.sort((a, b) => b.value - a.value);
};

export const MONTHS = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];
export const LANGUAGES = [
  { value: 'en', label: 'English', disabled: false },
  { value: 'fr', label: 'French', disabled: false },
  { value: 'es', label: 'Spanish', disabled: false },
  { value: 'de', label: 'German', disabled: false },
  { value: 'zh', label: 'Chinese', disabled: false },
  { value: 'ja', label: 'Japanese', disabled: false },
  { value: 'ko', label: 'Korean', disabled: false },
  { value: 'ru', label: 'Russian', disabled: false },
  { value: 'ar', label: 'Arabic', disabled: false },
  { value: 'pt', label: 'Portuguese', disabled: false },
  { value: 'it', label: 'Italian', disabled: false },
  { value: 'nl', label: 'Dutch', disabled: false },
  { value: 'sv', label: 'Swedish', disabled: false },
  { value: 'no', label: 'Norwegian', disabled: false },
  { value: 'da', label: 'Danish', disabled: false },
  { value: 'fi', label: 'Finnish', disabled: false },
  { value: 'pl', label: 'Polish', disabled: false },
  { value: 'tr', label: 'Turkish', disabled: false },
  { value: 'el', label: 'Greek', disabled: false },
  { value: 'th', label: 'Thai', disabled: false },
  { value: 'vi', label: 'Vietnamese', disabled: false },
  { value: 'he', label: 'Hebrew', disabled: false },
  { value: 'cs', label: 'Czech', disabled: false },
  { value: 'ro', label: 'Romanian', disabled: false },
  { value: 'hu', label: 'Hungarian', disabled: false },
  { value: 'uk', label: 'Ukrainian', disabled: false },
];
export const GENDER_OPTION = [
  { value: GenderEnum.FEMALE, label: GenderEnum.FEMALE },
  { value: GenderEnum.MALE, label: GenderEnum.MALE },
  { value: GenderEnum.OTHER, label: 'Non-binary' },
];

export const MARTIAL_STATUS_OPTION = [
  {
    value: MaritalStatusEnum.SINGLE,
    label: MaritalStatusEnum.SINGLE,
  },
  {
    value: MaritalStatusEnum.MARRIED,
    label: MaritalStatusEnum.MARRIED,
  },
  {
    value: MaritalStatusEnum.COMMON_LAW,
    label: MaritalStatusEnum.COMMON_LAW,
  },
  {
    value: MaritalStatusEnum.DOMESTIC_PARTNERSHIP,
    label: MaritalStatusEnum.DOMESTIC_PARTNERSHIP,
  },
];

export const GENDERS: { [key in GenderEnum]: GenderEnum } = {
  [GenderEnum.FEMALE]: GenderEnum.FEMALE,
  [GenderEnum.MALE]: GenderEnum.MALE,
  [GenderEnum.OTHER]: GenderEnum.OTHER,
};

export const MARITAL_STATUS = {
  [MaritalStatusEnum.SINGLE]: MaritalStatusEnum.SINGLE,
  [MaritalStatusEnum.COMMON_LAW]: MaritalStatusEnum.COMMON_LAW,
  [MaritalStatusEnum.MARRIED]: MaritalStatusEnum.MARRIED,
  [MaritalStatusEnum.DOMESTIC_PARTNERSHIP]: MaritalStatusEnum.DOMESTIC_PARTNERSHIP,
};
export const CANCELLATION_REASONS = [
  { value: 'Standard Cancellation', label: 'Standard Cancellation' },
  {
    value: 'Late Cancellation (less than 24h before session)',
    label: 'Late Cancellation (less than 24h before session)',
  },
  { value: 'No Show', label: 'No Show' },
  { value: 'Personal Sick Leave', label: 'Personal Sick Leave' },
  { value: 'Missed Session', label: 'Missed Session' },
  { value: 'Other', label: 'Other' },
];

export const SESSION_OPTIONS = [
  { value: 'Virtual', label: 'Virtual' },
  { value: 'Clinic', label: 'Clinic' },
];

export const MODAL_TITLES = {
  0: 'Schedule Appointment',
  1: 'Add New Patient',
  2: 'Book a Session',
  default: '',
};
export const YEARS = generateYears(1960);

export const selectStyles = {
  control: () => ({
    minHeight: '50px',
    padding: '4px 10px',
  }),
  input: () => ({
    fontSize: '16px',
  }),
  singleValue: () => ({
    fontSize: '16px',
  }),
  option: () => ({
    fontSize: '16px',
  }),
  menu: () => ({
    zIndex: '60',
  }),
};

export const phoneCountryJson: Record<string, string> = {
  '93': 'AF',
  '355': 'AL',
  '213': 'DZ',
  '376': 'AD',
  '244': 'AO',
  '1268': 'AG',
  '54': 'AR',
  '374': 'AM',
  '297': 'AW',
  '61': 'AU',
  '43': 'AT',
  '994': 'AZ',
  '1242': 'BS',
  '973': 'BH',
  '880': 'BD',
  '1246': 'BB',
  '375': 'BY',
  '32': 'BE',
  '501': 'BZ',
  '229': 'BJ',
  '975': 'BT',
  '591': 'BO',
  '387': 'BA',
  '267': 'BW',
  '55': 'BR',
  '246': 'IO',
  '673': 'BN',
  '359': 'BG',
  '226': 'BF',
  '257': 'BI',
  '855': 'KH',
  '237': 'CM',
  '238': 'CV',
  '599': ['BQ', 'CW'],
  '236': 'CF',
  '235': 'TD',
  '56': 'CL',
  '86': 'CN',
  '57': 'CO',
  '269': ['KM', 'YT'],
  '243': 'CD',
  '242': 'CG',
  '506': 'CR',
  '225': 'CI',
  '385': 'HR',
  '53': 'CU',
  '357': 'CY',
  '420': 'CZ',
  '45': 'DK',
  '253': 'DJ',
  '1767': 'DM',
  '593': 'EC',
  '20': 'EG',
  '503': 'SV',
  '240': 'GQ',
  '291': 'ER',
  '372': 'EE',
  '251': 'ET',
  '679': 'FJ',
  '358': 'FI',
  '33': 'FR',
  '594': 'GF',
  '689': 'PF',
  '241': 'GA',
  '220': 'GM',
  '995': 'GE',
  '49': 'DE',
  '233': 'GH',
  '30': 'GR',
  '1473': 'GD',
  '1671': 'GU',
  '502': 'GT',
  '224': 'GN',
  '245': 'GW',
  '592': 'GY',
  '509': 'HT',
  '504': 'HN',
  '852': 'HK',
  '36': 'HU',
  '354': 'IS',
  '91': 'IN',
  '62': 'ID',
  '98': 'IR',
  '964': 'IQ',
  '353': 'IE',
  '972': 'IL',
  '39': 'IT',
  '1876': 'JM',
  '81': 'JP',
  '962': 'JO',
  '7': ['KZ', 'RU'],
  '254': 'KE',
  '686': 'KI',
  '383': 'XK',
  '965': 'KW',
  '996': 'KG',
  '856': 'LA',
  '371': 'LV',
  '961': 'LB',
  '266': 'LS',
  '231': 'LR',
  '218': 'LY',
  '423': 'LI',
  '370': 'LT',
  '352': 'LU',
  '853': 'MO',
  '389': 'MK',
  '261': 'MG',
  '265': 'MW',
  '60': 'MY',
  '960': 'MV',
  '223': 'ML',
  '356': 'MT',
  '692': 'MH',
  '596': 'MQ',
  '222': 'MR',
  '230': 'MU',
  '52': 'MX',
  '691': 'FM',
  '373': 'MD',
  '377': 'MC',
  '976': 'MN',
  '382': 'ME',
  '1664': 'MS',
  '212': 'MA',
  '258': 'MZ',
  '95': 'MM',
  '264': 'NA',
  '674': 'NR',
  '977': 'NP',
  '31': 'NL',
  '687': 'NC',
  '64': 'NZ',
  '505': 'NI',
  '227': 'NE',
  '234': 'NG',
  '683': 'NU',
  '672': 'NF',
  '850': 'KP',
  '1670': 'MP',
  '47': 'NO',
  '968': 'OM',
  '92': 'PK',
  '680': 'PW',
  '970': 'PS',
  '507': 'PA',
  '675': 'PG',
  '595': 'PY',
  '51': 'PE',
  '63': 'PH',
  '48': 'PL',
  '351': 'PT',
  '974': 'QA',
  '262': 'RE',
  '40': 'RO',
  '250': 'RW',
  '590': ['BL', 'MF', 'GP'],
  '290': 'SH',
  '1869': 'KN',
  '1758': 'LC',
  '508': 'PM',
  '1784': 'VC',
  '685': 'WS',
  '378': 'SM',
  '239': 'ST',
  '966': 'SA',
  '221': 'SN',
  '381': 'RS',
  '248': 'SC',
  '232': 'SL',
  '65': 'SG',
  '1721': 'SX',
  '421': 'SK',
  '386': 'SI',
  '677': 'SB',
  '252': 'SO',
  '27': 'ZA',
  '82': 'KR',
  '211': 'SS',
  '34': 'ES',
  '94': 'LK',
  '249': 'SD',
  '597': 'SR',
  '46': 'SE',
  '41': 'CH',
  '963': 'SY',
  '886': 'TW',
  '992': 'TJ',
  '255': 'TZ',
  '66': 'TH',
  '670': 'TL',
  '228': 'TG',
  '690': 'TK',
  '676': 'TO',
  '1868': 'TT',
  '216': 'TN',
  '90': 'TR',
  '993': 'TM',
  '1649': 'TC',
  '688': 'TV',
  '256': 'UG',
  '380': 'UA',
  '971': 'AE',
  '44': 'GB',
  '598': 'UY',
  '998': 'UZ',
  '678': 'VU',
  '379': 'VA',
  '58': 'VE',
  '84': 'VN',
  '1': ['VI', 'CA', 'DO', 'PR', 'US', 'VG', 'VI'],
  '681': 'WF',
  '967': 'YE',
  '260': 'ZM',
  '263': 'ZW',
};

export const TIMEZONE_OPTIONS = [
  {
    value: 'America/Los_Angeles',
    label: `Pacific Time ${moment.tz(moment(), 'America/Los_Angeles').format('hh:mm A')} (PDT)`,
  },
  {
    value: 'America/New_York',
    label: `Eastern Time ${moment.tz(moment(), 'America/New_York').format('hh:mm A')} (EDT)`,
  },
  {
    value: 'America/Chicago',
    label: `Central Time ${moment.tz(moment(), 'America/Chicago').format('hh:mm A')} (CDT)`,
  },
];

export const RELATIONSHIP_OPTIONS = [
  { value: 'Minor', label: 'Minor' },
  { value: 'Family', label: 'Family' },
  { value: 'Couple', label: 'Couple' },
];

export const ACTIVE_STATUS_OPTION = [
  { value: ActiveStatusEnum.ACTIVE, label: ActiveStatusEnum.ACTIVE },
  { value: ActiveStatusEnum.INACTIVE, label: ActiveStatusEnum.INACTIVE },
];

export const AppointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Upcoming',
  [AppointmentStatus.IN_PROGRESS]: 'In Progress',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.Rescheduled]: 'Rescheduled',
  [AppointmentStatus.NO_SHOW]: 'No Show',
};

export const QueueStatusLabels: Record<QueueStatus, string> = {
  [QueueStatus.DENIED]: 'Denied',
  [QueueStatus.IN_PROGRESS]: 'In Progress',
  [QueueStatus.ESCALATED]: 'Escalated',
  [QueueStatus.OPEN]: 'Open',
  [QueueStatus.RESOLVED]: 'Resolved',
};

export const AssessmentFormStatusLabels: Record<FormStatusType, string> = {
  [FormStatusType.PENDING]: 'Pending',
  [FormStatusType.SUBMITTED]: 'Submitted',
};

export const APPOINTMENT_STATUS_OPTIONS =
  Object.values(AppointmentStatus).map(status => ({
    value: status,
    label: AppointmentStatusLabels[status],
  })) ?? [];

export const SESSION_TYPE_OPTIONS =
  Object.values(SessionType).map(type => ({
    value: type,
    label: type,
  })) ?? [];

export const FIELD_TYPE = {
  DATE_RANGE: 'dateRange',
  SELECT: 'select',
  REQUEST_TYPE: 'requestType',
  ASSIGNEE: 'assignee',
  TEXT: 'text',
  NUMBER: 'number',
  ASYNC_SELECT: 'asyncSelect',
  NUMBER_RANGE: 'numberRange',
} as const;

export const THERAPY_TYPE_OPTIONS: Record<TherapyType, string> = {
  [TherapyType.COUPLE]: 'Couple',
  [TherapyType.FAMILY]: 'Family',
  [TherapyType.MINOR]: 'Minor',
  [TherapyType.INDIVIDUAL]: 'Individual',
};

export const generateHexId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const allowedMessageFileTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ASSESSMENT_FORM_TYPE_OPTIONS = [
  {
    value: AssessmentFormType.CUSTOM,
    label: 'Custom',
  },
  {
    value: AssessmentFormType.ONE_TIME,
    label: 'One Time',
  },
  {
    value: AssessmentFormType.PER_APPOINTMENT,
    label: 'Per Appointment',
  },
  {
    value: AssessmentFormType.PER_SESSION,
    label: 'Per Session',
  },
];

export const ASSESSMENT_QUESTION_OPTIONS = [
  {
    value: QuestionTypeEnum.SINGLE_CHOICE,
    label: 'Single Choice',
  },
  {
    value: QuestionTypeEnum.CHECKBOX,
    label: 'Checkbox',
  },
  {
    value: QuestionTypeEnum.MULTIPLE_CHOICE,
    label: 'Multiple Choice',
  },
  {
    value: QuestionTypeEnum.FILE_UPLOAD,
    label: 'File Upload',
  },
  {
    value: QuestionTypeEnum.RADIO,
    label: 'Radio',
  },
  {
    value: QuestionTypeEnum.SHORT_ANSWER,
    label: 'Short Answer',
  },
  {
    value: QuestionTypeEnum.RATING,
    label: 'Rating',
  },
];

export const ASSESSMENT_FORM_STATUS_OPTIONS = [
  {
    value: FormStatusType.PENDING,
    label: FormStatusType.PENDING,
  },
  {
    value: FormStatusType.SUBMITTED,
    label: FormStatusType.SUBMITTED,
  },
];

export const FORM_CATEGORY_OPTIONS = [
  {
    value: FormCategory.OPTIONAL,
    label: FormCategory.OPTIONAL,
  },
  {
    value: FormCategory.REQUIRED,
    label: FormCategory.REQUIRED,
  },
];

export const PERMISSION_ERROR = 'You do not have permission to perform this action';
