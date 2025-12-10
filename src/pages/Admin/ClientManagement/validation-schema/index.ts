import moment from 'moment';
import * as yup from 'yup';

import { phoneCountryJson } from '@/constants/CommonConstant';
import { RelationEnum } from '@/enums';
import { yupCommon } from '@/helper/yupSchemaHelper';

import 'yup-phone-lite';

yup.setLocale({
  mixed: {
    required: '${path} is required',
  },
});

const commonValidationSchema = {
  first_name: yupCommon.string.label('First Name').required(),
  last_name: yupCommon.string.label('Last Name').required(),
  email: yupCommon.string.label('Email').email('Invalid email address').required(),
  phone: yup.string().trim().label('Contact Number').nullable(),
  dob: yup.string().label('Date of birth').required(),
  gender: yup
    .object()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .required()
    .label('Gender'),
};

const dependentSchema = yup.object().shape({
  relationship: yup.mixed<RelationEnum>().oneOf(Object.values(RelationEnum)).required(),
  ...commonValidationSchema,
  phone: commonValidationSchema.phone
    .required()
    .test('phone', 'Please Enter a Valid Number', value => {
      if (!value) return false;
      const countryCode = value?.split(' ')[0].substring(1);
      const countryShortCode = countryCode ? phoneCountryJson[countryCode] || 'US' : 'US';
      const phoneValidationSchema = yupCommon.string.phone(countryShortCode);
      return phoneValidationSchema.isValid(value);
    }),
  dob: commonValidationSchema.dob.test(
    'relationship-age-validation',
    'Invalid age for the selected relationship',
    function (value) {
      const { relationship } = this.parent;
      if (!value || !relationship) return true;

      const age = moment().diff(moment(value), 'years');
      if (!age) {
        return this.createError({
          message: 'Please enter valid birth date',
        });
      }
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
});

export const addPatientFormSchema = yup.object().shape({
  ...commonValidationSchema,

  phone: commonValidationSchema.phone
    .required('Phone is required')
    .test('phone', 'Please Enter a Valid Number', value => {
      if (!value) return true;
      const countryCode = value?.split(' ')[0].substring(1);
      const countryShortCode = countryCode ? phoneCountryJson[countryCode] || 'US' : 'US';
      const phoneValidationSchema = yup.string().phone(countryShortCode);

      return phoneValidationSchema.isValid(value);
    }),
  // profile_image: yup.mixed<File>().label('Profile Image'),
  dob: commonValidationSchema.dob.test('age', 'Must be older than 16 years', function (value) {
    if (!value) return true;
    const today = new Date();
    const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return new Date(value) < sixteenYearsAgo;
  }),
  dependents: yup
    .array()
    .of(dependentSchema)
    .test('unique-emails', null, function (dependents) {
      if (!dependents) return true;

      const emailMap = new Map<string, number[]>();

      dependents.forEach((dep, index) => {
        if (dep?.email) {
          const lowerEmail = dep.email.toLowerCase();
          if (!emailMap.has(lowerEmail)) {
            emailMap.set(lowerEmail, []);
          }
          emailMap.get(lowerEmail)!.push(index);
        }
      });

      // Find duplicates
      const duplicates = Array.from(emailMap.values()).filter(indices => indices.length > 1);

      if (duplicates.length) {
        // Attach error to *each duplicate email field*
        return this.createError({
          path: `dependents.${duplicates[0][0]}.email`, // Yup only returns one error per test
          message: 'Email must be unique',
        });
      }

      return true;
    }),
});

export type AddPatientFormType = yup.InferType<typeof addPatientFormSchema>;
