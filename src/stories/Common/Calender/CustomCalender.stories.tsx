import CustomCalendar from '.';

import type { Appointment, AvailableSlot } from './types';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CustomCalendar> = {
  title: 'CustomCalendar',
  component: CustomCalendar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive calendar component with multiple view modes, appointment management, and slot booking functionality.',
      },
    },
  },
  argTypes: {
    initialView: {
      control: { type: 'select' },
      options: ['Day', 'Week', 'Month'],
      description: 'Initial view mode of the calendar',
    },
    startFromMonday: {
      control: { type: 'boolean' },
      description: 'Whether to start the week from Monday',
    },
    timeFormat: {
      control: { type: 'select' },
      options: ['12hr', '24hr'],
      description: 'Time format for displaying time slots',
    },
    workHours: {
      control: { type: 'object' },
      description: 'Working hours configuration',
    },
    appointments: {
      control: { type: 'object' },
      description: 'Array of appointments to display',
    },
    availableSlots: {
      control: { type: 'object' },
      description: 'Array of available time slots',
    },
    onAppointmentClick: {
      action: 'appointment-clicked',
      description: 'Callback when an appointment is clicked',
      table: {
        type: { summary: '(appointment: Appointment) => void' },
        defaultValue: { summary: 'undefined' },
      },
    },
    onSlotSelect: {
      action: 'slot-selected',
      description: 'Callback when a slot is selected',
      table: {
        type: { summary: '(slot: SlotSelection) => void' },
        defaultValue: { summary: 'undefined' },
      },
    },
    onAvailableSlotSet: {
      action: 'available-slot-set',
      description: 'Callback when an available slot is set',
      table: {
        type: { summary: '(slot: AvailableSlot) => void' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CustomCalendar>;

// Sample data generators
const generateSampleAppointments = (count: number = 5): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const startTime = new Date(today);
    startTime.setDate(today.getDate() + Math.floor(Math.random() * 7));
    startTime.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 2) * 30, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + (30 + Math.floor(Math.random() * 3) * 30));
  }

  return appointments;
};

const generateSampleAvailableSlots = (count: number = 8): AvailableSlot[] => {
  const slots: AvailableSlot[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const slotTime = new Date(today);
    slotTime.setDate(today.getDate() + Math.floor(Math.random() * 7));
    slotTime.setHours(10 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 2) * 30, 0, 0);

    slots.push({
      slot_time: slotTime.toISOString(),
      date: slotTime.toISOString().split('T')[0],
      available: true,
    });
  }

  return slots;
};

// Default story - Week view
export const Default: Story = {
  args: {
    initialView: 'Week',
    startFromMonday: false,
    timeFormat: '24hr',
    workHours: { start: 8, end: 18 },
    appointments: generateSampleAppointments(3),
    availableSlots: generateSampleAvailableSlots(5),
    onAppointmentClick: data => console.log(data),
    onSlotSelect: data => console.log(data),
    onAvailableSlotSet: data => console.log(data),
  },
};

// Day view story
export const DayView: Story = {
  args: {
    ...Default.args,
    initialView: 'Day',
    appointments: generateSampleAppointments(2),
    availableSlots: generateSampleAvailableSlots(3),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar in Day view mode showing detailed hourly slots for a single day.',
      },
    },
  },
};

// Month view story
export const MonthView: Story = {
  args: {
    ...Default.args,
    initialView: 'Month',
    appointments: generateSampleAppointments(10),
    availableSlots: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar in Month view mode showing a monthly overview with appointments.',
      },
    },
  },
};

// Week view starting from Monday
export const WeekStartingMonday: Story = {
  args: {
    ...Default.args,
    initialView: 'Week',
    startFromMonday: true,
    appointments: generateSampleAppointments(5),
    availableSlots: generateSampleAvailableSlots(4),
  },
  parameters: {
    docs: {
      description: {
        story: 'Week view with Monday as the first day of the week.',
      },
    },
  },
};

// 12-hour time format
export const TwelveHourFormat: Story = {
  args: {
    ...Default.args,
    timeFormat: '12hr',
    workHours: { start: 9, end: 17 },
    appointments: generateSampleAppointments(4),
    availableSlots: generateSampleAvailableSlots(6),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar using 12-hour time format (AM/PM) instead of 24-hour format.',
      },
    },
  },
};

// Extended work hours (24/7)
export const ExtendedHours: Story = {
  args: {
    ...Default.args,
    workHours: { start: 0, end: 24 },
    appointments: [
      {
        id: 'appt-1',
        title: 'Night Shift Meeting',
        client: 'DevOps Team',
        type: 'group',
        startTime: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(23, 30, 0, 0)).toISOString(),
        description: 'Late night team meeting',
        location: 'Remote',
        color: 'bg-blue-500',
      },
      {
        id: 'appt-2',
        title: 'Early Morning Standup',
        client: 'Scrum Team',
        type: 'group',
        startTime: new Date(new Date().setHours(6, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
        description: 'Daily standup meeting',
        location: 'Google Meet',
        color: 'bg-green-500',
      },
    ],
    availableSlots: generateSampleAvailableSlots(3),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Calendar with 24/7 working hours showing early morning and late night appointments.',
      },
    },
  },
};

// Busy calendar with many appointments
export const BusySchedule: Story = {
  args: {
    ...Default.args,
    appointments: generateSampleAppointments(15),
    availableSlots: generateSampleAvailableSlots(10),
    workHours: { start: 8, end: 20 },
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with a busy schedule showing multiple appointments and available slots.',
      },
    },
  },
};

// Empty calendar
export const EmptyCalendar: Story = {
  args: {
    ...Default.args,
    appointments: [],
    availableSlots: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty calendar with no appointments or available slots.',
      },
    },
  },
};

// Calendar with only available slots
export const AvailableSlotsOnly: Story = {
  args: {
    ...Default.args,
    appointments: [],
    availableSlots: generateSampleAvailableSlots(12),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar showing only available time slots without any appointments.',
      },
    },
  },
};

// Custom work hours (9-5)
export const StandardWorkHours: Story = {
  args: {
    ...Default.args,
    workHours: { start: 9, end: 17 },
    appointments: [
      {
        id: 'appt-1',
        title: 'Night Shift Meeting',
        client: 'DevOps Team',
        type: 'group',
        startTime: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(23, 30, 0, 0)).toISOString(),
        description: 'Late night team meeting',
        location: 'Remote',
        color: 'bg-blue-500',
      },
      {
        id: 'appt-2',
        title: 'Early Morning Standup',
        client: 'Scrum Team',
        type: 'group',
        startTime: new Date(new Date().setHours(6, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
        description: 'Daily standup meeting',
        location: 'Google Meet',
        color: 'bg-green-500',
      },
    ],
    availableSlots: generateSampleAvailableSlots(8),
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with standard 9-5 work hours showing typical business day appointments.',
      },
    },
  },
};
