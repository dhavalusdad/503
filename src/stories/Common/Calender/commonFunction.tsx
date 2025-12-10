import moment, { type Moment } from 'moment-timezone';

import type {
  CalendarCell,
  TimeSlot,
  TimeSlotFormat,
  ViewMode,
  WeekDayData,
} from '@/stories/Common/Calender/types';

/**
 * Parses a UTC date string and returns a Date object in the local timezone.
 */
export const createLocalDate = (dateString: string): Date => {
  return moment.utc(dateString).local().toDate();
};

/**
 * Formats a Date or ISO string into "HH:MM" format (24-hour).
 * @example "09:30"
 */
export const formatToHourMinute = (
  dateStr: string | Date | Moment,
  timezone: string = moment.tz.guess()
): string => {
  return moment.tz(dateStr, timezone).format('HH:mm');
};

/**
 * Converts a Date object into a local date string in "YYYY-MM-DD" format.
 * This is used for comparison and data-binding purposes.
 */
export const getLocalDateString = (
  date: Date | Moment,
  timezone: string = moment.tz.guess()
): string => {
  return moment.tz(date, timezone).format('YYYY-MM-DD');
};

/**
 * Combines a date string ("YYYY-MM-DD") and a time string ("HH:MM")
 * into a single Date object.
 */
export const createAppointmentDate = (
  dateStr: string,
  timeStr: string,
  timezone: string = moment.tz.guess()
): Date => {
  return moment.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD HH:mm', timezone).toDate();
};

/**
 * Generates an array of weekday metadata (`WeekDayData`) based on the current date and view.
 * Supports `Day`, `Week`, and `Month` views, and optional week start preference (Monday/Sunday).
 */

export const getCurrentWeekDates = (
  startFromMonday: boolean = true,
  setWeekDays?: (days: WeekDayData[]) => void,
  Offset: number = 0,
  view: ViewMode = 'Day',
  timezone: string = moment.tz.guess(), // Use detected timezone
  baseDate: Date = new Date()
): WeekDayData[] => {
  const today = moment.tz(baseDate, timezone); // use moment for base date
  const day = today.day(); // 0 (Sun) to 6 (Sat)

  const mode: Record<ViewMode, number> = {
    Day: 1,
    Month: 7,
    Week: 7,
  };

  let diff = 0;

  if (view === 'Day') {
    diff = 0;
  } else {
    diff = startFromMonday ? (day === 0 ? -6 : 1 - day) : -day;
  }

  const startOfWeek = today.clone().add(diff + Offset * mode[view], 'days');

  const weekdays: WeekDayData[] = [];

  for (let i = 0; i < mode[view]; i++) {
    const date = startOfWeek.clone().add(i, 'days');

    weekdays.push({
      day: date.format('ddd'), // Mon, Tue
      date: date.format('YYYY-MM-DD'),
      year: date.year(),
      month: date.format('MMM'), // Jan, Feb
      dateNum: date.date(),
      active: i === 0,
    });
  }

  setWeekDays?.(weekdays);
  return weekdays;
};

/**
 * Generates time slots for a given day between `startHour` and `endHour`.
 * Supports both 12hr and 24hr display formats, with customizable step interval.
 */

export const generateTimeSlots = (
  date: string | null = null,
  startHour: number = 0,
  endHour: number = 24,
  format: TimeSlotFormat = '24hr',
  stepMinutes: number = 60,
  timezone: string = moment.tz.guess()
): TimeSlot[] => {
  const baseMoment = date
    ? moment.tz(`${date}T00:00:00`, timezone)
    : moment.tz(timezone).startOf('day');
  const slots: TimeSlot[] = [];

  // Calculate total minutes in the time range
  const totalMinutes = (endHour - startHour) * 60;

  // Generate slots based on step size
  for (let minuteOffset = 0; minuteOffset < totalMinutes; minuteOffset += stepMinutes) {
    const slotMoment = baseMoment
      .clone()
      .hour(startHour)
      .minute(0)
      .second(0)
      .millisecond(0)
      .add(minuteOffset, 'minutes');

    // Skip if we've gone past the end hour
    if (slotMoment.hour() >= endHour) {
      break;
    }

    const displayTime =
      format === '12hr' ? slotMoment.format('h:mm A') : slotMoment.format('HH:mm');

    slots.push({
      label: displayTime,
      hour: slotMoment.hour(),
      minute: slotMoment.minute(),
      value: slotMoment.toDate(),
      timeString: slotMoment.format('HH:mm'),
    });
  }

  return slots;
};

/**
 * Generates a 2D array representing the calendar grid (weeks and days)
 * for the given month and year. Each cell includes date, day, and month match info.
 */
export const getCalendarMonthGrid = (
  year: number,
  month: number, // 0-indexed (0 = January)
  timezone: string = moment.tz.guess()
): CalendarCell[][] => {
  const result: CalendarCell[][] = [];

  const firstDayOfMonth = moment.tz({ year, month, day: 1 }, timezone);
  const startDayOfWeek = firstDayOfMonth.day(); // 0 = Sunday
  const startDate = firstDayOfMonth.clone().subtract(startDayOfWeek - 1, 'days');

  const currentDate = startDate.clone();

  for (let week = 0; week < 6; week++) {
    const weekRow: CalendarCell[] = [];

    // Optimization: skip empty weeks after 4th if all days are from next month
    if (week > 3 && currentDate.month() !== month) break;

    for (let day = 0; day < 7; day++) {
      weekRow.push({
        date: currentDate.toDate(),
        day: currentDate.date(),
        isCurrentMonth: currentDate.month() === month,
      });
      currentDate.add(1, 'day');
    }

    result.push(weekRow);
  }

  return result;
};
/**
 * Compares two dates (string or Date) and returns true if they represent the same calendar day.
 * Both dates are normalized using local time to avoid timezone mismatches.
 */

export const isSameDay = (
  date1: string | Date | Moment,
  date2: string | Date | Moment,
  timezone: string = moment.tz.guess()
): boolean => {
  const d1 = typeof date1 === 'string' ? date1 : getLocalDateString(date1, timezone);
  const d2 = typeof date2 === 'string' ? date2 : getLocalDateString(date2, timezone);
  return d1 === d2;
};

/**
 * Compares two time values (string or Date) and returns true if they represent the same hour and minute.
 * Both values are normalized to "HH:MM" format to ensure consistent comparison.
 *
 * @param time1 - A Date object or string representing a time (e.g., "14:30" or Date object)
 * @param time2 - A Date object or string representing a time
 * @returns True if both times are equal in "HH:MM" format
 */

export const isSameTimeSlot = (
  time1: string | Date | Moment,
  time2: string | Date | Moment,
  timezone: string = moment.tz.guess()
): boolean => {
  const t1 = typeof time1 === 'string' ? time1 : formatToHourMinute(time1, timezone);
  const t2 = typeof time2 === 'string' ? time2 : formatToHourMinute(time2, timezone);
  return t1 === t2;
};
