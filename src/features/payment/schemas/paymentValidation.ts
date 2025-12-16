import * as yup from 'yup';

import type { SelectOption } from '@/stories/Common/Select';

export interface PaymentFormData {
  cardNumber: string;
  expirationMonth: SelectOption | null;
  expirationYear: SelectOption | null;
  defaultPaymentProfile: boolean;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export const paymentMethodSchema = yup.object().shape({
  cardNumber: yup
    .string()
    .required('Card number is required')
    .matches(/^[0-9]{13,19}$/, 'Please enter a valid card number (13-19 digits)'),
  expirationMonth: yup
    .mixed()
    .required('Expiration month is required')
    .test('is-valid', 'Please select a month', (value: unknown) => {
      const selectValue = value as SelectOption | null;
      return !!selectValue?.value;
    })
    .test(
      'is-not-expired',
      'Card expiration date cannot be in the past',
      function (value: unknown) {
        const selectValue = value as SelectOption | null;
        const { expirationYear } = this.parent as PaymentFormData;
        if (!selectValue?.value || !expirationYear?.value) return true;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

        const selectedYear = parseInt(String(expirationYear.value));
        const selectedMonth = parseInt(String(selectValue.value));

        // If selected year is greater than current year, it's valid
        if (selectedYear > currentYear) return true;

        // If selected year equals current year, check if month is >= current month
        if (selectedYear === currentYear) {
          return selectedMonth >= currentMonth;
        }

        // If selected year is less than current year, it's expired
        return false;
      }
    ),
  expirationYear: yup
    .mixed()
    .required('Expiration year is required')
    .test('is-valid', 'Please select a year', (value: unknown) => {
      const selectValue = value as SelectOption | null;
      return !!selectValue?.value;
    })
    .test(
      'is-not-expired',
      'Card expiration date cannot be in the past',
      function (value: unknown) {
        const selectValue = value as SelectOption | null;
        const { expirationMonth } = this.parent as PaymentFormData;
        if (!selectValue?.value || !expirationMonth?.value) return true;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const selectedYear = parseInt(String(selectValue.value));
        const selectedMonth = parseInt(String(expirationMonth.value));

        // If selected year is greater than current year, it's valid
        if (selectedYear > currentYear) return true;

        // If selected year equals current year, check if month is >= current month
        if (selectedYear === currentYear) {
          return selectedMonth >= currentMonth;
        }

        // If selected year is less than current year, it's expired
        return false;
      }
    ),
  defaultPaymentProfile: yup.boolean(),
  address: yup.string().required().label('Address'),
  city: yup.string().required().label('City'),
  state: yup.string().required().label('State'),
  country: yup.string().required().label('Country'),
  zip: yup.string().required().label('Zip Code'),
});
