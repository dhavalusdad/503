import * as yup from 'yup';

import type { OptionType } from '@/features/calendar/types';
import { yupCommon } from '@/helper/yupSchemaHelper';

export const areaOfFocusSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters long'),
});
export const ReminderWidgetsSchema = yup.object().shape({
  name: yup
    .string()
    .required('Widget Name is required')
    .min(3, 'Widget Name must be at least 3 characters long'),
});
export const TagSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tag Name is required')
    .min(3, 'Tag Name must be at least 3 characters long'),
  color: yup
    .string()
    .required('Color Name is required')
    .min(3, 'Color Code must be at least 3 characters long'),
});

export const SessionTagSchema = yup.object().shape({
  name: yup
    .string()
    .required('Tag Name is required')
    .min(3, 'Tag Name must be at least 3 characters long'),
});

export const ClinicAddressSchema = yup.object().shape({
  name: yupCommon.string
    .label('Clinic Name')
    .required()
    .min(2, 'Name must be at least 2 characters long'),
  address: yupCommon.string.label('Address Line').required(),
  state_id: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .label('State')
    .required(),
  city_id: yup
    .object()
    .shape({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .label('City')
    .required(),
});

export const credentialingSchema = yup
  .object<{
    carrierName: OptionType | null;
    dateRoster: string | Date | null;
    recredentialDate: string | Date | null;
    state: OptionType | null;
    idNumber: string;
    ticketId: string;
    status: string;
    credentialDate: string | Date | null;
    recredentialInProgress: boolean;
  }>()
  .shape({
    carrierName: yup.object<OptionType>().nullable().required('Carrier name is required'),
    dateRoster: yup.mixed<string | Date>().nullable().required('Date Roster is required'),
    credentialDate: yup.mixed<string | Date>().nullable().required('Credential Date is required'),
    recredentialDate: yup.mixed<string | Date>().nullable(),
    state: yup.object<OptionType>().nullable().required('State name is required'),
    idNumber: yup
      .string()
      .required('ID Number is required')
      .matches(/^[A-Za-z0-9]+$/, 'ID Number must be alphanumeric'),
    ticketId: yup.string().required('Ticket ID is required'),
    status: yup.string().required('Status is required'),
    recredentialInProgress: yup.boolean(),
  });
