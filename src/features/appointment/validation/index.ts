import moment, { type Moment } from 'moment';
import * as yup from 'yup';

export const noteSchema = yup.object().shape({
  title: yup.string().trim().required('Title is required'),
  content: yup.string().trim().required('Content is required'),
  //   appointment_id: yup.string().uuid('Invalid appointment ID').required('Appointment ID is required'),
  //   therapist_id: yup.string().uuid('Invalid therapist ID').required('Therapist ID is required'),
  //   client_id: yup.string().uuid('Invalid client ID').required('Client ID is required'),
});

export const LogSessionFormSchema = (timezone: string) =>
  yup.object().shape({
    start_time: yup.date().required('Start time is required'),
    end_time: yup
      .date()
      .required('End time is required')
      .test('end-time-should-be-greater', 'End time must be after start time', function (value) {
        const { start_time } = this.parent;
        if (!value || !start_time) return true;

        const start = moment.tz(start_time, timezone);
        const end = moment.tz(value, timezone);

        const startMinutes = start.hours() * 60 + start.minutes();
        const endMinutes = end.hours() * 60 + end.minutes();

        return endMinutes > startMinutes;
      }),
    reason: yup.string().required('Reason is required'),
  });

export const EndSessionFormSchema = (
  timezone: string,
  oldStart: Moment | string | null,
  oldEnd: Moment | string | null
) =>
  yup.object().shape({
    start_time: yup.date().nullable(),
    end_time: yup
      .date()
      .nullable()
      .test('end-after-start', 'End time must be after start time', function (value) {
        const { start_time } = this.parent;
        if (!value || !start_time) return true;

        const start = moment.tz(start_time, timezone);
        const end = moment.tz(value, timezone);

        const startMinutes = start.hours() * 60 + start.minutes();
        const endMinutes = end.hours() * 60 + end.minutes();

        return endMinutes > startMinutes;
      }),
    reason: yup.string().when(['start_time', 'end_time'], {
      is: (start_time: Date | null, end_time: Date | null) => {
        const oldStartTime = oldStart ? moment(oldStart).toISOString() : null;
        const oldEndTime = oldEnd ? moment(oldEnd).toISOString() : null;

        const newStartTime = start_time ? moment(start_time).toISOString() : null;
        const newEndTime = end_time ? moment(end_time).toISOString() : null;

        // Require reason ONLY if modified
        return oldStartTime !== newStartTime || oldEndTime !== newEndTime;
      },
      then: schema => schema.required('Reason is required when modifying session times').min(20),
      otherwise: schema => schema.optional(),
    }),

    notes: yup.string().nullable(),
  });
