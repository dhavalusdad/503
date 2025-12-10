import _ from 'lodash';
import * as yup from 'yup';

import { phoneCountryJson, TIMEZONE_OPTIONS } from '@/constants/CommonConstant';
import { GenderEnum, MaritalStatusEnum } from '@/enums';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const SUPPORTED_FORMATS = ['image/png', 'image/jpg', 'image/jpeg'];
const TIMEZONE_VALUES = TIMEZONE_OPTIONS.map(option => option.value);

export const clientProfileValidationSchema = yup.object().shape({
  profile_image: yup
    .mixed<File>()
    .nullable()
    .test('fileSize', 'File size should be less than 2MB', value => {
      if (!value || !(value instanceof File)) return true;
      return value.size <= MAX_FILE_SIZE;
    })
    .test('fileFormat', 'Unsupported file format. Only jpg, jpeg, png allowed', value => {
      if (!value || !(value instanceof File)) return true;
      return SUPPORTED_FORMATS.includes(value.type);
    }),

  first_name: yup
    .string()
    .trim()
    .required('First name is required')
    .max(100, 'First name must be at most 100 characters'),

  last_name: yup
    .string()
    .trim()
    .required('Last name is required')
    .max(100, 'Last name must be at most 100 characters'),

  dob: yup
    .date()
    .nullable()
    .typeError('Date of birth must be a valid date')
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),

  gender: yup
    .mixed<GenderEnum>()
    .oneOf(Object.values(GenderEnum), 'Invalid gender')
    .required('Gender is required'),

  // email: yup
  //   .string()
  //   .trim()
  //   .email('Invalid email format')
  //   .required('Email is required')
  //   .max(255, 'Email must be at most 255 characters'),

  marital_status: yup
    .mixed<MaritalStatusEnum>()
    .oneOf(Object.values(MaritalStatusEnum), 'Invalid marital status')
    .required('Marital status is required'),

  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .max(20, 'Phone number must be at most 20 characters'),

  address: yup
    .string()
    .trim()
    .required('Address is required')
    .max(500, 'Address must be at most 500 characters'),

  timezone: yup.string().nullable().oneOf(TIMEZONE_VALUES, 'Please select a valid timezone'),

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

  postal_code: yup
    .string()
    .trim()
    .required('Postal code is required')
    .max(10, 'Postal code must be at most 10 characters'),

  allergies: yup.string().trim().nullable(),

  emergency_contact: yup
    .string()
    .trim()
    .nullable()
    .max(20, 'Emergency contact number must be at most 20 characters'),
});

export const adminProfileValidationSchema = yup.object().shape({
  profile_image: yup
    .mixed<File>()
    .nullable()
    .test('fileSize', 'File size should be less than 2MB', value => {
      if (!value || !(value instanceof File)) return true;
      return value.size <= MAX_FILE_SIZE;
    })
    .test('fileFormat', 'Unsupported file format. Only jpg, jpeg, png allowed', value => {
      if (!value || !(value instanceof File)) return true;
      return SUPPORTED_FORMATS.includes(value.type);
    }),

  first_name: yup
    .string()
    .trim()
    .required('First name is required')
    .max(100, 'First name must be at most 100 characters'),

  last_name: yup
    .string()
    .trim()
    .required('Last name is required')
    .max(100, 'Last name must be at most 100 characters'),

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
});
