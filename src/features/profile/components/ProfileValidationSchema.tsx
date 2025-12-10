import _ from 'lodash';
import * as yup from 'yup';

import { phoneCountryJson } from '@/constants/CommonConstant';
import 'yup-phone-lite';
import { yupCommon } from '@/helper/yupSchemaHelper';

yup.setLocale({
  mixed: {
    required: '${path} is required',
  },
  array: {
    min: ({ min, path }) => `Select at least ${min} ${path ? path.toLowerCase() : ''}`,
  },
});

const commonValidation = {
  patient_age: yupCommon.string
    .nullable()
    .test('valid-max-age', 'Age must be a positive number without leading zeros', val => {
      if (!val) return true;
      return /^[1-9][0-9]*$/.test(val);
    })
    .test('range', 'Age must be between 1 and 130', val => {
      if (!val) return true;
      const num = Number(val);
      return num >= 1 && num <= 130;
    }),
};

const therapistProfileSchemaObj = {
  area_of_focus: yup.array().of(yup.object()).label('Expertise'),
  bio: yupCommon.string.label('Bio').max(3000),
  min_patient_age: commonValidation.patient_age.label('Minimum patient age'),
  max_patient_age: commonValidation.patient_age
    .label('Maximum patient age')
    .test('max-greater-than-min', 'Maximum age must be greater than minimum age', function (value) {
      const { min_patient_age } = this.parent;
      if (!value || !min_patient_age) return true;
      return Number(value) > Number(min_patient_age);
    }),
};

export const therapistProfileSchema = yup.object().shape({
  first_name: yupCommon.string.label('First name').required().min(2).max(50),
  last_name: yupCommon.string.label('Last Name').required().min(2).max(50),
  email: yupCommon.string.label('Email').email('Invalid email address').required(),
  phone: yup
    .string()
    .trim()
    .label('Phone')
    .test('phone', 'Please Enter a Valid Number', value => {
      if (_.isEmpty(value)) return false;
      const countryCode = value?.split(' ')[0].substring(1);
      const countryShortCode = countryCode ? phoneCountryJson[countryCode] || 'US' : 'US'; // Default to "US" if no matching code is found
      const phoneValidationSchema = yup.string().phone(countryShortCode);
      return phoneValidationSchema.isValid(value);
    })
    .required(),
  dob: yup
    .date()
    .label('Date of birth')
    .nullable()
    .test('age', 'Must be older than 18 years to register', function (value) {
      if (!value) return true;
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return value < eighteenYearsAgo;
    }),
  gender: yup.object().label('Gender').nullable(),
  marital_status: yup.object().label('Marital status').nullable(),
  video_session: yup
    .boolean()
    .test('at-least-one-session', 'Please choose at least one preference.', function () {
      const { video_session, clinic_session } = this.parent;
      return Boolean(video_session || clinic_session);
    }),
  clinic_session: yup.boolean(),
  // .test(
  //   'clinic-session-required-if-clinic-address',
  //   "Please select 'At Clinic' if you have entered a clinic address",
  //   function (value) {
  //     const { clinic_address } = this.parent;
  //     if (clinic_address && clinic_address.length > 0) return Boolean(value);
  //     return true;
  //   }
  // ),
  languages: yup.array().of(yup.object()).label('Languages'),
  area_of_focus: yup.lazy((_, ctx) =>
    ctx.context?.isTherapistPanel
      ? therapistProfileSchemaObj.area_of_focus.min(1).required()
      : therapistProfileSchemaObj.area_of_focus
  ),
  therapy_types: yup.array().of(yup.object()).label('Therapy Type').min(1).required(),
  clinic_address: yup
    .array()
    .of(yup.object())
    .label('Clinic address')
    .default([])
    .test(
      'clinic-address-required-if-at-clinic',
      "Clinic address is required when 'At Clinic' is selected",
      function (value) {
        const { clinic_session } = this.parent;
        const addresses = Array.isArray(value) ? value : [];
        if (clinic_session && addresses.length === 0) {
          return this.createError({
            message: "Clinic address is required when 'At Clinic' is selected",
          });
        }
        return true;
      }
    )
    .nullable(),
  bio: yup.lazy((_, ctx) =>
    ctx.context?.isTherapistPanel
      ? therapistProfileSchemaObj.bio.required()
      : therapistProfileSchemaObj.bio
  ),
  profile_image: yupCommon.string.label('Profile Image').nullable(),
  npi_number: yupCommon.string.label('NPI Number').length(10).required(),
  min_patient_age: yup.lazy((_, ctx) =>
    ctx.context?.isTherapistPanel
      ? therapistProfileSchemaObj.min_patient_age.required()
      : therapistProfileSchemaObj.min_patient_age
  ),
  max_patient_age: yup.lazy((_, ctx) =>
    ctx.context?.isTherapistPanel
      ? therapistProfileSchemaObj.max_patient_age.required()
      : therapistProfileSchemaObj.max_patient_age
  ),
  address1: yup.string().label('Street 1').nullable(),
  address2: yup.string().label('Street 2').nullable(),
  city: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .label('City')
    .required(),
  state: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .label('State')
    .required(),
  country: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .label('Country')
    .required(),
  postal_code: yup.string().label('ZIP').nullable(),
});

export const experienceSchema = yup
  .object({
    designation: yupCommon.string.required().nonNullable().label('Designation'),
    organization: yupCommon.string.required().nonNullable().label('Organization'),
    location: yupCommon.string.required().nonNullable().label('Location'),
    currentlyWorking: yup.boolean(),
    start_month: yup.object().required().label('Start month'),
    start_year: yup.object().required().label('Start year'),
    end_month: yup
      .object()
      .nullable()
      .when('currentlyWorking', {
        is: false,
        then: schema => schema.label('End month').required(),
        otherwise: schema => schema.nullable().notRequired(),
      }),
    end_year: yup
      .object()
      .nullable()
      .when('currentlyWorking', {
        is: false,
        then: schema => schema.label('End year').required(),
        otherwise: schema => schema.nullable().notRequired(),
      }),
    specialty: yupCommon.string.optional().label('Specialty').nullable(),
  })
  .test('start-date-not-in-future', 'Start date cannot be in the future', function (value) {
    const { start_month, start_year } = value;

    if (!start_month || !start_year) return true;

    const startDate = new Date(start_year.value, start_month.value - 1);
    const today = new Date();

    if (startDate > today) {
      return this.createError({
        path: 'start_year',
        message: 'Start date cannot be in the future',
      });
    }
    return true;
  })
  .test('end-date-not-in-future', 'End date cannot be in the future', function (value) {
    const { end_month, end_year } = value;

    if (!end_month || !end_year) return true;

    const endDate = new Date(end_year.value, end_month.value - 1);
    const today = new Date();

    if (endDate > today) {
      return this.createError({
        path: 'end_year',
        message: 'End date cannot be in the future',
      });
    }
    return true;
  })
  .test('end-date-validation', 'End date cannot be before start date', function (value) {
    const { start_month, start_year, end_month, end_year, currentlyWorking } = value;

    if (currentlyWorking || !end_month || !end_year || !start_year || !start_month) return true;

    const start = new Date(start_year.value, start_month.value - 1);
    const end = new Date(end_year.value, end_month.value - 1);

    if (end < start) {
      return this.createError({
        path: 'end_year',
        message: 'End date cannot be before start date',
      });
    }

    return true;
  });

export const awardSchema = yup.object({
  awardName: yupCommon.string.label('Award name').required(),

  associatedWith: yupCommon.string.nonNullable().defined(), // optional
  issuer: yupCommon.string.nonNullable().defined(), // optional
  date: yupCommon.string.nonNullable().defined(), // optional (can add .matches() for formatting if needed)
  description: yupCommon.string.nonNullable().defined(), // optional

  issueDate: yup
    .object({
      month: yupCommon.string.required().label('Issue month'),
      year: yupCommon.string.required().label('Issue year'),
    })
    .defined(),
});

export const AddDegreeModalSchema = yup.object({
  name: yupCommon.string.required().label('Degree Name'),
});

export const EducationSchema = yup
  .object({
    institution: yupCommon.string.required().label('Institution'),
    degree: yup.object().label('Degree').nullable(),
    specialization: yupCommon.string.nullable().label('Major/Specialization'),
    gpa: yupCommon.string.nullable().label('GPA'),
    start_date: yupCommon.string.nullable().label('Start date'),
    end_date: yupCommon.string.nullable().label('End date'),
  })
  .test('end-date-validation', 'End date cannot be before start date', function (value) {
    const { start_date, end_date } = value;

    if (!start_date || !end_date) return true;

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end < start) {
      return this.createError({
        path: 'end_date',
        message: 'End date cannot be before start date',
      });
    }

    return true;
  });
