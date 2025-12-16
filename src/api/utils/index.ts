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

  // Filter out invalid or incomplete experiences
  roles = roles.filter(role => !!role.start_month && !!role.start_year);

  // Sort the experiences based on their start date
  roles.sort((a, b) => {
    const startA = new Date(a.start_year!, a.start_month! - 1);
    const startB = new Date(b.start_year!, b.start_month! - 1);
    return startA.getTime() - startB.getTime();
  });

  // Merge overlapping or contiguous durations
  const mergedExperiences: { start: Date; end: Date }[] = [];

  roles.forEach(({ start_year, start_month, end_year, end_month }) => {
    const start = new Date(start_year!, start_month! - 1, 1);
    const end = end_year && end_month ? new Date(end_year, end_month, 0) : new Date();

    if (mergedExperiences.length === 0) {
      mergedExperiences.push({ start, end });
    } else {
      const lastMerged = mergedExperiences[mergedExperiences.length - 1];

      // Check if the current experience overlaps or is contiguous with the last merged one
      if (start <= lastMerged.end) {
        // Merge the two ranges
        lastMerged.end = new Date(Math.max(lastMerged.end.getTime(), end.getTime()));
      } else {
        // No overlap, add as a new range
        mergedExperiences.push({ start, end });
      }
    }
  });

  // Calculate total months from merged periods
  const totalMonths = mergedExperiences.reduce((sum, { start, end }) => {
    const startIndex = start.getFullYear() * 12 + start.getMonth();
    const endIndex = end.getFullYear() * 12 + end.getMonth();
    return sum + (endIndex - startIndex + 1); // +1 to include both start and end months
  }, 0);

  // Convert total months to years and months
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

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

export const getNormalizedPath = (path: string) =>
  path
    // replace UUIDs with :id
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    // remove trailing /*
    .replace(/\/\*$/, '')
    // remove trailing /
    .replace(/\/$/, '');

export const getNormalizedParam = (route: string) => route.replace(/:\w+/g, ':id');
