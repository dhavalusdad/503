import moment from 'moment';

export const START_TIME_DIFFERENCE = 15;
export const END_TIME_DIFFERENCE = -30;

export const checkIfSessionCanBeStarted = ({
  start_time,
  end_time,
  timezone,
}: {
  start_time: string;
  end_time: string;
  timezone: string;
}) => {
  const startTimeMoment = moment(start_time).tz(timezone || 'UTC');
  const endTimeMoment = moment(end_time).tz(timezone);

  const now = moment().tz(timezone || 'UTC');

  const minutesDiff = startTimeMoment.diff(now, 'minutes');
  const endDiff = endTimeMoment.diff(now, 'minutes');
  return {
    sessionCannotBeStarted: minutesDiff > START_TIME_DIFFERENCE || endDiff < END_TIME_DIFFERENCE,
    minutesDiff,
  };
};
