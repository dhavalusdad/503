import moment from 'moment';

// Helper to generate calendar days
export const getMonthDaysTz = (year: number, month: number, timezone: string) => {
  // Start at the 1st of the month in user timezone
  const startOfMonth = moment.tz({ year, month, day: 1 }, timezone);
  const endOfMonth = startOfMonth.clone().endOf('month');

  // Start from Monday of the first week
  const startDate = startOfMonth.clone().startOf('week').add(1, 'day');
  // End on Sunday of the last week
  let endDate = endOfMonth.clone().endOf('week').add(1, 'day');

  if (endOfMonth.day() === 0) {
    endDate = endOfMonth.clone();
  }

  const days: { date: Date; inCurrentMonth: boolean }[] = [];
  const cursor = startDate.clone();

  while (cursor.isSameOrBefore(endDate, 'day')) {
    days.push({
      date: cursor.toDate(),
      inCurrentMonth: cursor.month() === month,
    });
    cursor.add(1, 'day');
  }

  return days;
};
