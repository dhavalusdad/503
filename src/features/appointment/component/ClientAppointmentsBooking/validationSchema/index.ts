// Validation Schema
import _ from 'lodash';
import * as yup from 'yup';

import { phoneCountryJson } from '@/constants/CommonConstant';
import { GenderEnum, SessionType, PaymentMethodEnum } from '@/enums';
import type { SelectOption } from '@/features/calendar/types';
import { yupCommon } from '@/helper/yupSchemaHelper';
import 'yup-phone-lite';

export const getMemberSchema = (memberType: string) => {
  return yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    dateOfBirth: yup.string().required('Date of birth is required'),
    gender: yup.string().required('Gender is required'),
    age: yup.string().min(1, 'Age must be greater than 0'),

    phone:
      memberType === 'family'
        ? yup.string().required('Phone number is required')
        : yup.string().nullable(),

    email:
      memberType === 'family'
        ? yup.string().email('Invalid email').required('Email is required')
        : yup.string().nullable(),

    emergencyContact:
      memberType === 'minor'
        ? yup.string().required('Emergency contact is required')
        : yup.string().nullable(),
    relationshipType:
      memberType === 'couple'
        ? yup.string().required('Relationship type is required').defined()
        : yup.string().nullable(),
  });
};
export const validationSchemaClientBooking = yup.object().shape({
  sessionType: yup
    .mixed()
    .test('sessionType', 'Session type is required', function (value) {
      if (!value) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'object' && value !== null) {
        return value.value && value.value.trim().length > 0;
      }
      return false;
    })
    .required('Session type is required'),
  selectedDate: yup.date().required('Date is required'),
  selectedTime: yup.string().trim().required('Time is required'),
  therapyType: yup
    .mixed()
    .test('therapyType', 'Therapy type is required', function (value) {
      if (!value) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'object' && value !== null) {
        return value.value && value.value.trim().length > 0;
      }
      return false;
    })
    .required('Therapy type is required')
    .defined()
    .label('Therapy type'),
  areaOfFocus: yup
    .array()
    .test('areaOfFocus', 'At least one area of focus is required', function (value) {
      if (!value || !Array.isArray(value)) return false;
      return value.length > 0;
    })
    .required('At least one area of focus is required'),
  visitReason: yup.string().trim().nullable().notRequired(),
  appointmentType: yup
    .array()
    .min(1, 'At least one appointment type is required')
    .required('Appointment type is required'),
  clinic: yup
    .object()
    .when('sessionType', {
      is: (value: SelectOption | string) => {
        if (typeof value === 'string') return value === 'Clinic';
        if (typeof value === 'object' && value !== null) return value.value === 'Clinic';
        return false;
      },
      then: schema =>
        schema.shape({
          id: yup.string().trim().required('Please select a clinic'),
          name: yup.string().trim().required('Please select a clinic'),
        }),
      otherwise: schema =>
        schema.shape({
          id: yup.string().trim().notRequired(),
          name: yup.string().trim().notRequired(),
        }),
    })
    .nullable(),
});

export const clientQuickDetailsSchema = yup.object().shape({
  first_name: yupCommon.string.label('First name').required().min(2).max(50),
  last_name: yupCommon.string.label('Last Name').required().min(2).max(50),
  email: yupCommon.string.label('Email').email('Invalid email address').required(),
  reason_for_visit: yupCommon.string.label('Reason For Visit').optional(),
  phone: yup
    .string()
    .trim()
    .label('Phone')
    .test('phone', 'Please Enter a Valid Number', async value => {
      if (_.isEmpty(value)) return false;
      const countryCode = value?.split(' ')[0].substring(1);
      const countryShortCode = countryCode ? phoneCountryJson[countryCode] || 'US' : 'US'; // Default to "US" if no matching code is found
      const phoneValidationSchema = yup.string().phone(countryShortCode);
      return await phoneValidationSchema.isValid(value);
    })
    .required(),
  dob: yup
    .date()
    .label('Date of birth')
    .required()
    .test('age', 'Must be older than 16 years to register', function (value) {
      if (!value) return true;
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
      );
      return value < eighteenYearsAgo;
    }),
  clinic: yup.object().when('$sessionType', {
    is: (sessionType: string) => sessionType === SessionType.CLINIC,
    then: schema =>
      schema
        .shape({
          id: yup.string().trim().required('Please select a clinic'),
          name: yup.string().trim().required('Please select a clinic'),
        })
        .required('Clinic is required'),
    otherwise: schema => schema.optional().nullable(),
  }),
  appointment_type: yup
    .array()
    .min(1, 'At least one appointment type is required')
    .required('Appointment type is required'),
});

export const requestSlotSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  dob: yup
    .date()
    .label('Date of birth')
    .required('Date of birth is required')
    .test('age', 'Must be older than 16 years to register', function (value) {
      if (!value) return true;
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
      );
      return value < eighteenYearsAgo;
    }),
  gender: yup
    .mixed<GenderEnum>()
    .oneOf(Object.values(GenderEnum), 'Invalid gender')
    .required('Gender is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
});

export const appointmentFilterSchema = yup.object().shape({
  state: yup.object().nullable(),
  city: yup.object().nullable().optional(),
  paymentMethod: yup.object().nullable().required('Payment method is required'),
  carrier: yup
    .mixed()
    .transform(val => (val === '' ? null : val)) // convert "" -> null
    .when('paymentMethod', {
      is: (pm: { label: string }) => pm?.label === PaymentMethodEnum.Insurance,
      then: schema => schema.required('Insurance carrier is required'),
      otherwise: schema => schema.nullable(),
    }),
  therapyType: yup.object().nullable().required('Therapy type is required'),
  areaOfFocus: yup.array().min(1, 'Select at least one Area of Focus').required(),
  sessionType: yup.object().nullable().required('Session Type is required'),
});
