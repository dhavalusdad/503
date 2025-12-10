import _ from 'lodash';

import { isDefined } from '@/api/utils';
import { FIELD_TYPE } from '@/constants/CommonConstant';

import type { CommonFilterField } from '..';
import type { DefaultValues } from 'react-hook-form';

export const getActiveFilterCount = <T extends Record<string, unknown>>({
  filterFields,
  filters,
}: {
  filterFields: CommonFilterField<T>[];
  filters: DefaultValues<T>;
}): number => {
  let count = 0;
  filterFields.forEach(item => {
    const { type, name } = item;
    const value = filters[name];
    if (_.isUndefined(value) || _.isNull(value)) return;
    switch (type) {
      case FIELD_TYPE.DATE_RANGE: {
        const dateValue = value as { startDate?: string | null; endDate?: string | null };
        if (dateValue.startDate || dateValue.endDate) {
          count++;
        }
        break;
      }
      case FIELD_TYPE.NUMBER_RANGE: {
        const numberValue = value as { min?: number; max?: number };
        if (
          (_.isObject(numberValue) && isDefined(numberValue?.min)) ||
          isDefined(numberValue?.max)
        ) {
          count++;
        }
        break;
      }
      default: {
        if (_.isArray(value)) {
          if (value.length > 0) {
            count += value.length;
          }
        } else {
          count++;
        }
        break;
      }
    }
  });
  return count;
};
