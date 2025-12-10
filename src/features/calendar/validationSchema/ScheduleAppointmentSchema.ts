import moment from 'moment';
import * as yup from 'yup';

import 'yup-phone-lite';
import { phoneCountryJson } from '@/constants/CommonConstant';

export const createPatientSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),

  phone: yup
    .string()
    .trim()
    .label('Phone')
    .test('phone', 'Please Enter a Valid Number', async value => {
      if (!value) return false;
      const countryCode = value?.split(' ')[0].substring(1);
      const countryShortCode = countryCode ? phoneCountryJson[countryCode] || 'US' : 'US';
      return yup.string().phone(countryShortCode).isValid(value);
    })
    .required(),

  dob: yup
    .string()
    .required('Date of birth is required')
    .test('age', 'Patient must be at least 16 years old', value => {
      if (!value) return false;

      const dob = moment(value, ['YYYY-MM-DD', 'MM/DD/YYYY'], true);
      if (!dob.isValid()) return false;

      const todayMinus16 = moment().subtract(16, 'years');

      return dob.isSameOrBefore(todayMinus16, 'day');
    }),
});
