import moment from 'moment';
import * as yup from 'yup';
export const signInSchema = yup.object().shape({
  email: yup.string().defined().required('Email is required').email('Invalid email address'),
  password: yup.string().defined().required('Password is required'),
});

export const registrationSchema = yup.object({
  firstName: yup.string().required('First name is required'),

  lastName: yup.string().required('Last name is required'),
  email: yup.string().required('Email is required').email('Please enter a valid email address'),
  dob: yup
    .string()
    .required('Date of birth is required')
    .test('age', 'You must be at least 16 years old', value => {
      if (!value) return false;

      const dob = moment(value, ['YYYY-MM-DD', 'MM/DD/YYYY'], true);

      if (!dob.isValid()) return false;

      const sixteenYearsAgo = moment().subtract(16, 'years');

      return dob.isSameOrBefore(sixteenYearsAgo, 'day');
    }),
  createPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('createPassword')], 'Passwords do not match'),
});

export const validationSchema = yup.object().shape({
  newPassword: yup
    .string()
    .defined()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .defined()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const emailValidationSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Please enter a valid email address'),
});
