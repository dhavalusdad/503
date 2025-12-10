import _ from 'lodash';
import * as yup from 'yup';

import 'yup-phone-lite';
import { phoneCountryJson } from '@/constants/CommonConstant';

export const addStaffMemberSchema = yup.object().shape({
  first_name: yup.string().trim().required('First name is required'),
  last_name: yup.string().trim().required('Last name is required'),
  email: yup.string().required('Email is required').email('Please enter a valid email address'),
  phone: yup
    .string()
    .label('Phone')
    .test('phone', 'Please Enter a Valid Number', value => {
      if (_.isEmpty(value)) return false;
      const countryCode = value?.split(' ')[0].substring(1);
      const countryShortCode = phoneCountryJson[countryCode] || 'US'; // Default to "US" if no matching code is found
      const phoneValidationSchema = yup.string().phone(countryShortCode);
      return phoneValidationSchema.isValid(value);
    })
    .required(),
  role: yup.string().required('Role is required'),
});
