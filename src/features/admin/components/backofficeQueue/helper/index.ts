import _ from 'lodash';

import { MONTHS } from '@/constants/CommonConstant';

import { FIELD_LABELS, FIELD_ORDER } from '../constant';

import type {
  ExperienceValueType,
  TableDataChange,
  TableNamesType,
  TransformedField,
} from '../types';

const DEFAULT_VAL = '-';

const formatDate = (month: number | null, year: number | null) => {
  if (!_.isNumber(month) || !_.isNumber(year)) return '-';
  return `${MONTHS.find(m => m.value === month)?.label ?? ''} ${year ?? ''}`;
};

const getExpFieldDisplayValue = (
  field:
    | 'designation'
    | 'organization'
    | 'location'
    | 'currentlyWorking'
    | 'start_date'
    | 'end_date'
    | 'specialty',
  fieldVal: ExperienceValueType
) => {
  let val = DEFAULT_VAL;
  if (!fieldVal) return val;

  if (field === 'start_date') {
    val = formatDate(fieldVal.start_month, fieldVal.start_year) || DEFAULT_VAL;
  } else if (field === 'end_date') {
    val = formatDate(fieldVal.end_month, fieldVal.end_year) || DEFAULT_VAL;
  } else if (field === 'currentlyWorking') {
    val = !fieldVal.end_month ? 'Yes' : 'No';
  } else {
    val = fieldVal[field] || '-';
  }

  return val;
};

export const transformTableData = (
  exp: TableDataChange,
  table_name: TableNamesType
): TransformedField[] => {
  const oldVal = exp.old_value;
  const newVal = exp.new_value;
  const arr = table_name === 'experience' ? FIELD_ORDER.EXPERIENCE : FIELD_ORDER.EDUCATION;
  const obj = arr.map(field => {
    return {
      label: FIELD_LABELS[field],
      old_value: oldVal
        ? table_name === 'experience'
          ? getExpFieldDisplayValue(field, oldVal)
          : oldVal[field] || '-'
        : DEFAULT_VAL,
      new_value: newVal
        ? table_name === 'experience'
          ? getExpFieldDisplayValue(field, newVal)
          : newVal[field] || '-'
        : DEFAULT_VAL,
    };
  });

  return obj;
};
