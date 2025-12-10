import moment from 'moment';
import * as yup from 'yup';

import { GenderEnum, RelationEnum } from '@/enums';

export const dependentValidationSchema = yup.object().shape({
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

  email: yup
    .string()
    .trim()
    .email('Invalid email format')
    .required('Email is required')
    .max(255, 'Email must be at most 255 characters'),

  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .max(20, 'Phone number must be at most 20 characters'),

  dob: yup
    .date()
    .nullable()
    .typeError('Date of birth must be a valid date')
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .test(
      'relationship-age-validation',
      'Invalid age for the selected relationship',
      function (value) {
        const { relationship } = this.parent;
        if (!value || !relationship) return true;

        const age = moment().diff(moment(value), 'years');

        if (relationship === RelationEnum.MINOR && age >= 16) {
          return this.createError({
            message: 'For minors, age must be less than 16 years',
          });
        }

        if ([RelationEnum.COUPLE, RelationEnum.FAMILY].includes(relationship) && age < 16) {
          return this.createError({
            message: 'For couple/family, age must be 16 years or older',
          });
        }

        return true;
      }
    ),

  gender: yup
    .mixed<GenderEnum>()
    .oneOf(Object.values(GenderEnum), 'Invalid gender')
    .required('Gender is required'),

  relationship: yup
    .mixed<RelationEnum>()
    .oneOf(Object.values(RelationEnum), 'Invalid relationship')
    .required('Relationship is required'),
});

export const dependentValidationModalSchema = yup.object({
  dependents: yup.array().of(
    yup.object().shape({
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

      email: yup
        .string()
        .trim()
        .email('Invalid email format')
        .required('Email is required')
        .max(255, 'Email must be at most 255 characters'),

      phone: yup
        .string()
        .trim()
        .required('Phone number is required')
        .max(20, 'Phone number must be at most 20 characters'),

      dob: yup
        .date()
        .nullable()
        .typeError('Date of birth must be a valid date')
        .required('Date of birth is required')
        .max(new Date(), 'Date of birth cannot be in the future')
        .test(
          'relationship-age-validation',
          'Invalid age for the selected relationship',
          function (value) {
            const { relationship } = this.parent;
            if (!value || !relationship) return true;

            const age = moment().diff(moment(value), 'years');

            if (relationship === RelationEnum.MINOR && age >= 16) {
              return this.createError({
                message: 'For minors, age must be less than 16 years',
              });
            }

            if ([RelationEnum.COUPLE, RelationEnum.FAMILY].includes(relationship) && age < 16) {
              return this.createError({
                message: 'For couple/family, age must be 16 years or older',
              });
            }

            return true;
          }
        ),

      gender: yup
        .mixed<GenderEnum>()
        .oneOf(Object.values(GenderEnum), 'Invalid gender')
        .required('Gender is required'),
    })
  ),
});
