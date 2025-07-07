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