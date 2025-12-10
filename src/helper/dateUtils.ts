import moment from 'moment';

// Common date formatting functions using moment.js

/**
 * Format date to "MMM DD, YYYY" (e.g., "Jan 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  return moment(dateString).format('MMM DD, YYYY');
};

/**
 * Format date to "MMM DD, YYYY HH:mm" (e.g., "Jan 15, 2024 14:30")
 */
export const formatDateTime = (dateString: string): string => {
  return moment(dateString).format('MMM DD, YYYY HH:mm');
};

/**
 * Format date to "YYYY-MM-DD" (e.g., "2024-01-15")
 */
export const formatDateISO = (dateString: string): string => {
  return moment(dateString).format('YYYY-MM-DD');
};

/**
 * Format date to "MM/DD/YYYY" (e.g., "01/15/2024")
 */
export const formatDateShort = (dateString: string): string => {
  return moment(dateString).format('MM/DD/YYYY');
};

/**
 * Get relative time (e.g., "2 days ago", "3 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  return moment(dateString).fromNow();
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
  return moment(dateString).isSame(moment(), 'day');
};

/**
 * Check if date is in the past
 */
export const isPast = (dateString: string): boolean => {
  return moment(dateString).isBefore(moment(), 'day');
};

/**
 * Check if date is in the future
 */
export const isFuture = (dateString: string): boolean => {
  return moment(dateString).isAfter(moment(), 'day');
};

/**
 * Get current date in ISO format
 */
export const getCurrentDateISO = (): string => {
  return moment().format('YYYY-MM-DD');
};

/**
 * Get current date and time in ISO format
 */
export const getCurrentDateTimeISO = (): string => {
  return moment().format('YYYY-MM-DDTHH:mm:ss');
};

export const DATE_FORMATS = {
  LONG: 'MMMM D, YYYY', // e.g., April 16, 2024
  SHORT: 'MM/DD/YYYY', // e.g., 04/16/2024
  TIME: 'h:mm A', // e.g., 3:45 PM
  FULL: 'MMMM D, YYYY h:mm A', // e.g., April 16, 2024 3:45 PM
  YEAR: 'YYYY',
  DEFAULT: 'YYYY-MM-DD HH:mm:ss',
  WITH_TZ: 'YYYY-MM-DD HH:mm:ss z',
  DATE_SHORT_TIME: 'DD/MM/yyyy HH:mm',
  SHORT_MONTH_AND_YEAR: 'MMM YYYY',
};

export const formatDateLabel = (dateKey: string, dateFormat: string = 'D MMMM YYYY'): string => {
  const date = moment(dateKey, 'DD/MM/YYYY');
  const today = moment();
  const yesterday = moment().subtract(1, 'days');

  if (date.isSame(today, 'day')) {
    return 'Today';
  } else if (date.isSame(yesterday, 'day')) {
    return 'Yesterday';
  } else {
    return date.format(dateFormat);
  }
};
