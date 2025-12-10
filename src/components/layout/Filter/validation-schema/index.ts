import * as yup from 'yup';

import { FIELD_TYPE } from '@/constants/CommonConstant';

import type { CommonFilterField } from '..';

const filterDateRangeSchema = yup
  .object({
    startDate: yup.string().nullable(),
    endDate: yup.string().nullable(),
  })
  .test('both-or-none', 'Start and End Date are required together', function (value) {
    const { startDate, endDate } = value || {};
    if (startDate && !endDate) return this.createError({ message: 'End Date is required' });
    if (endDate && !startDate) return this.createError({ message: 'Start Date is required' });
    return true;
  });

const filterNumberRangeSchema = yup
  .object({
    min: yup.string().nullable(),
    max: yup.string().nullable(),
  })
  .test('both-or-none', 'Min and Max validation', function (value) {
    const { min, max } = value || {};
    const minVal = Number(min);
    const maxVal = Number(max);
    if (minVal && max) {
      if (minVal > maxVal) {
        return this.createError({ message: 'Min count cannot be greater than max count' });
      } else if (maxVal < minVal) {
        return this.createError({ message: 'Max count cannot be greater than min count' });
      } else {
        return true;
      }
    }
    return true;
  });

export const getFilterValidationSchema = <T extends Record<string, unknown>>(
  fields: CommonFilterField<T>[]
) => {
  const dateRangeFields = fields.filter(item => item.type === FIELD_TYPE.DATE_RANGE);
  const numberRangeFields = fields.filter(item => item.type === FIELD_TYPE.NUMBER_RANGE);
  const filterSchema: Record<string, yup.AnySchema> = {};
  dateRangeFields.forEach(field => {
    filterSchema[field.name] = filterDateRangeSchema;
  });
  numberRangeFields.forEach(field => {
    filterSchema[field.name] = filterNumberRangeSchema;
  });

  return yup.object().shape(filterSchema);
};
