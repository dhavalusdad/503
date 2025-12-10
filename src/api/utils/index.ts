import _ from 'lodash';

import type { OptionType } from '@/api/types/field-option.dto';
import { MONTHS } from '@/constants/CommonConstant.ts';

import type { AxiosError } from 'axios';

/**
 * Compares two arrays of strings and returns the items that were added and removed.
 *
 * @param current - The current array of items (e.g., after an update).
 * @param previous - The previous array of items (e.g., before an update).
 * @returns An object containing:
 *   - new: items present in 'current' but not in 'previous' (added items)
 *   - deleted: items present in 'previous' but not in 'current' (removed items)
 */
export const getAddedAndRemovedItems = (
  current: OptionType[] = [],
  previous: OptionType[] = []
) => {
  const currentVals = current.map(item => item.value);
  const prevVals = previous.map(item => item.value);
  return {
    new: _.difference(currentVals, prevVals),
    deleted: _.difference(prevVals, currentVals),
  };
};

type WorkDurationParams = {
  start_year: number;
  start_month: number;
  end_year?: number;
  end_month?: number;
};

export const getWorkedDuration = (input: WorkDurationParams[] | WorkDurationParams): string => {
  if (!_.isArray(input)) {
    const { start_month, start_year } = input;
    if (!start_month && !start_year) return 'Invalid experience';
  }
  let roles = Array.isArray(input) ? input : [input];
  if (!roles.length) return 'No experience';

  roles = roles.filter(role => !!role.start_month && !!role.start_year);

  const startDates = roles.map(
    ({ start_year, start_month }) => new Date(start_year, start_month - 1, 1)
  );

  const endDates = roles.map(({ end_year, end_month }) =>
    end_year && end_month ? new Date(end_year, end_month, 0) : new Date()
  );

  const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
  const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));

  let years = latestEnd.getFullYear() - earliestStart.getFullYear();
  let months = latestEnd.getMonth() - earliestStart.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  months += 1;
  if (months === 12) {
    years++;
    months = 0;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);

  return parts.length ? parts.join(' ') : 'Less than a month';
};

export const getMonthNameByMonthNumber = (index: number) => {
  return MONTHS.find(month => month.value === index)?.label;
};

export const timeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds} sec ago`;
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export const isDefined = (value: unknown) => {
  return !_.isNil(value);
};

export const shouldReportToSentry = (
  axiosError: AxiosError,
  responseData: { success: boolean; message: string } | undefined
): boolean => {
  const status = axiosError.response?.status;

  // 1. User mistake errors → no reporting
  const isUserMistake = status !== undefined && status >= 400 && status < 500;

  // 2. Known backend business logic error
  const isCustomBackendError =
    responseData?.success === false && typeof responseData?.message === 'string';

  // 3. Expected auth/validation/operational errors
  const expectedOperationalStatuses = [400, 401, 403, 404, 409, 422];
  const isExpectedStatus = status !== undefined && expectedOperationalStatuses.includes(status);

  // 4. Network or cancelled errors (React Query often triggers these)
  const ignoredNetworkCodes = ['ECONNABORTED', 'ERR_CANCELED', 'ERR_NETWORK'];

  const errorCode = axiosError.code;
  const isNetworkIssue = typeof errorCode === 'string' && ignoredNetworkCodes.includes(errorCode);

  // ----- FINAL FILTER -----
  return !(isCustomBackendError || isExpectedStatus || isUserMistake || isNetworkIssue);
};
