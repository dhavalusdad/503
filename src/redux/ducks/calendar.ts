import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { AvailabilitySlot } from '@/features/calendar/types';

interface CalendarState {
  availableSlots: AvailabilitySlot[];
  selectedSlots: AvailabilitySlot;
}

const initialState: CalendarState = {
  availableSlots: [],
  selectedSlots: [],
};

const calendar = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setAvailableSlots: (state, action: PayloadAction<AvailabilitySlot[]>) => {
      state.avilbleSlots = action.payload;
    },

    setSelectedSlots: (state, action: PayloadAction<AvailabilitySlot>) => {
      state.selectedSlots = action.payload;
    },
  },
});

export const selectSelectedSlots = (state: { calendar: CalendarState }) =>
  state.calendar.selectedSlots;

export const { setAvailableSlots, setSelectedSlots } = calendar.actions;

export default calendar.reducer;
