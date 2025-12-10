import React, { type MouseEvent, type ReactNode } from 'react';

import moment from 'moment-timezone';

import type { CreateAvailabilitySlotsRequest } from '@/api/types/calendar.dto';

import type { Moment } from 'moment';

// Consistent selection state type
export type SelectionStateType = {
  isSelecting: boolean;
  dayIndex: number[];
  startIndex: number | null;
  endIndex: number | null;
  startDateTime?: string | undefined;
  endDateTime?: string | undefined;
};

export interface SelectionState extends SelectionStateType {
  action?: 'REMOVE' | 'CREATE';
}

export type TimeSlotFormat = '12hr' | '24hr';

export interface TimeSlot {
  label: string;
  hour: number;
  minute: number;
  value: Date;
  timeString: string;
}

export interface CalendarCell {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
}

export interface WeekDayData {
  day: string;
  date: string;
  year: number;
  month: string;
  dateNum: number;
  active: boolean;
}

export interface MonthCellInterface {
  cell: CalendarCell;
  appointments: Appointment[];
  handleAppointmentClick: (e: MouseEvent, appointment: Appointment) => void;
  index: number;
  timeZone?: string;
}

export interface ActiveMonthData {
  month: string;
  year: string;
  date: Moment;
}

export interface Appointment {
  id: string;
  status: string;
  created_at: string;
  client: {
    id: string;
    user: {
      profile_image: string;
      first_name: string;
      last_name: string;
    };
  };
  therapist?: {
    id: string;
  };
  therapy_type: {
    name: string;
    id: string;
  };
  slot: {
    id: string;
    start_time: string;
    end_time: string;
  };
  payment_method?: string | null;
  video_room_name: string;
}

export type CalendarConfig = {
  activeDate: string;
  activeMonth: string;
  activeYear: string;
  activeDay: string;
  activeWeekDay: string;
  Offset: number;
};
export type localStorageCalendarConfig = {
  Offset: number;
  view: ViewMode;
};

export type AvailableTimeSlotsPerDay = {
  id?: string;
  therapist_id?: string;
  date?: Moment | string;
  start_time?: Moment | string;
  end_time?: Moment | string;
  status?: string;
};

export interface AvailableSlot extends AvailableTimeSlotsPerDay {
  available?: boolean; // Make optional
}

export type ViewMode = 'Day' | 'Week' | 'Month';

export interface CalendarProps {
  appointments?: Appointment[];
  availableSlots?: AvailableSlot[];
  onSlotsRemove: (uniqueSlotsToRemove: AvailableTimeSlotsPerDay[]) => void;
  userId?: string;
  onAppointmentClick: (e: MouseEvent, appointment: Appointment) => void;
  onSlotSelect: (slot: CreateAvailabilitySlotsRequest) => void;
  onAvailableSlotSet: (slotTime: string) => void;
  initialView?: ViewMode;
  startFromMonday?: boolean;
  timeFormat?: TimeSlotFormat;
  workHours?: {
    start: number;
    end: number;
  };
  timeZone?: string;
  slotTimeInterval?: number;
  slotTimeSlotSize?: number;
  displayHourOnly?: boolean;
  AdditionalActionButton?: ReactNode;
  monthPagination?: {
    startDate: string;
    endDate: string;
  };
  handleMonthPagination?: (startDate: string, endDate: string) => void;
  slotConfiguration?: {
    slotDuration: number; // Duration in minutes (15, 30, 60, etc.)
    enforceSlotAlignment?: boolean; // Whether to enforce slot alignment
  };
  slotRange: number[];
}

export interface CalendarTopBarProps {
  view: ViewMode;
  activeMonth: ActiveMonthData;
  start?: WeekDayData | undefined;
  end?: WeekDayData | undefined;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  onTabChange: (tab: string) => void;
  timeInterval: number;
  setTimeInterval: (time: number) => void;
  slotRange: number[];
  children?: ReactNode;
}

export interface AppointmentCardProps {
  appointment: Appointment;
  isPast?: boolean;
  index: number;
  onClick: (e: MouseEvent, appointment: Appointment, dayIndex: number) => void;
  dayIndex?: number;
  slotIndex?: number;
  totalTimeSlots?: number;
  resultHeight?: number;
  isAbsolute?: boolean;
  isDayView?: boolean;
  timeZone?: string;
  timeInterval?: number;
  slotSize?: number;
  availableSlotData?: AvailableTimeSlotsPerDay;
  currentSlotTime?: string;
}

export interface CalendarHeaderProps {
  view: ViewMode;
  weekday: WeekDayData[];
}

export interface SelectSlotRangTimeInfoInterface {
  timeLine: TimeSlot[];
  selection: SelectionState;
  slotIndex: number;
  timeZone?: string;
}

export interface AvailableSlotBookingButtonInterface {
  handleConfirmSelection: () => void;
  handleSelectionCleaner?: () => void;
  shouldRenderAppointment?: boolean;
}

export interface MonthViewComponentInterface {
  month: CalendarCell[][];
  appointments?: Appointment[];
  handleAppointmentClick: (e: MouseEvent, appointment: Appointment, dayIndex: number) => void;
  timeZone?: string;
}

// UPDATED DayColumnInterface
export interface DayColumnInterface {
  data: WeekDayData;
  dayIndex: number;
  timeLine: TimeSlot[];
  selection: SelectionStateType;
  view: ViewMode;
  timeZone: string;
  slotSize: number;
  timeInterval: number;
  setRemoveSlots: React.Dispatch<React.SetStateAction<SelectionStateType>>;
  removeSlot: SelectionStateType;
  handleSelectionCleaner: () => void;
  handleRemoveSelectedSlot: () => void;
  handleRemoveSlot: (slot: object) => void;
  onAvailableSlotClick: (slotTime: string) => void;
  findAppointmentForSlot: (slotId: string) => Appointment | null;
  isSlotAvailable: (date: string, slotTime: moment.Moment) => boolean;
  findAvailableSlotForTimeSlot: (
    date: string,
    slotTime: moment.Moment
  ) => AvailableTimeSlotsPerDay | undefined;
  onAppointmentClick: (e: MouseEvent, appointment: Appointment, dayIndex: number) => void;
  onConfirmSelection: () => void;
  onMouseDown?: (
    dayIndex: number,
    slotIndex: number,
    hasAppointment: boolean,
    isMarkedAvailableSlot?: boolean
  ) => (e: React.MouseEvent) => void;
  onMouseEnter?: (dayIndex: number, slotIndex: number) => (e: React.MouseEvent) => void;
  onMouseOver?: (dayIndex: number) => (e: React.MouseEvent) => void;
  // Virtualization properties
  virtualizedSlotIndex?: number;
  isVirtualized?: boolean;
}

// UPDATED TimeSlotCellInterface
export interface TimeSlotCellInterface {
  isPast: boolean;
  slotIndex: number;
  dayIndex: number;
  handleRemoveSelectedSlots: () => void;
  // showAvailableSlot: boolean;
  time: TimeSlot;
  availableSlotData: AvailableTimeSlotsPerDay;
  handleSelectionCleaner: () => void;
  setRemoveSlots: React.Dispatch<React.SetStateAction<SelectionStateType>>;
  data: WeekDayData;
  removeSlot: SelectionStateType;
  appointmentStartTime?: Appointment | null;
  isValidDateSync: boolean;
  result: number;
  isSelected: boolean;
  isMarkedAvailableSlot?: boolean;
  availableSlotTime?: string | moment.Moment;
  totalTimeSlots?: number;
  selection: SelectionStateType;
  view: ViewMode;
  timeLine: TimeSlot[];
  slotSize: number;
  timeInterval: number;
  timeZone: string;
  onAvailableSlotClick: (slotTime: string) => void;
  onConfirmSelection: () => void;
  onAppointmentClick: (e: MouseEvent, appointment: Appointment, dayIndex: number) => void;
  isDisabledSelection?: boolean;
  isDisabledSelectionBasedOnPreviousSlot?: boolean;
  futureConflict: boolean;
  pastConflict: boolean;
}

export type AppointmentDetailsPopupProps = {
  appointment: Appointment;
  onClose: () => void;
  dayIndex: number;
  position: {
    topBottomDirection?: string;
    leftRightDirection?: string;
    top: number;
    left: number;
    direction?: {
      topBottomDirection: string;
      leftRightDirection: string;
    };
  };
  timeZone?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
};

export const MONTH_DAY_WEEK_TOGGLE: ViewMode[] = ['Day', 'Week', 'Month'];

export enum MODE_CONSTANT {
  DAY = 'Day',
  MONTH = 'Month',
  WEEK = 'Week',
}

export interface AvailableSlotCardProps {
  slotTime: string | moment.Moment; // The available slot time (ISO format)
  onSlotClick?: (slotTime: string) => void;
  timeZone?: string;
  timeInterval: number;
  slotSize: number;
  currentSlotTime: string; // Current timeline slot time (HH:mm format)
  isDayView?: boolean;
  customStyle?: React.CSSProperties;
  availableSlotTime?: string | moment.Moment;
  className?: string;
  setRemoveSlots: React.Dispatch<React.SetStateAction<SelectionStateType>>;
  dayIndex: number;
  slotIndex: number;
  removeSlot: SelectionStateType;
  isSelected: boolean;
  handleSelectionCleaner: () => void;
  handleRemoveSelectedSlot: () => void;
  isDisabledSelection?: boolean;
  availableSlotData?: AvailableTimeSlotsPerDay;
  futureConflict: boolean;
  pastConflict: boolean;
}
