import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

interface AppointmentFiltersState {
  therapyType: { value: string; label: string } | null;
  areaOfFocus: { value: string; label: string }[];
  language: { value: string; label: string } | null;
  city: { value: string; label: string } | null;
  therapistGender: string | null;
  sessionType: string | null;
  paymentMethod: { value: string; label: string } | null;
  state: { value: string; label: string } | null;
  carrier: { value: string; label: string } | null;
}

const initialState: AppointmentFiltersState = {
  therapyType: null,
  areaOfFocus: [],
  language: null,
  therapistGender: null,
  sessionType: null,
  city: null,
  state: null,
  paymentMethod: null,
  carrier: null,
};

const appointmentFilters = createSlice({
  name: 'appointment-filters',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<AppointmentFiltersState>) => {
      state.therapyType = action.payload.therapyType;
      state.areaOfFocus = action.payload.areaOfFocus;
      state.language = action.payload.language;
      state.therapistGender = action.payload.therapistGender;
      state.sessionType = action.payload.sessionType;
      state.city = action.payload.city;
      state.paymentMethod = action.payload.paymentMethod;
      state.state = action.payload.state;
      state.carrier = action.payload.carrier;
    },
    clearAppointmentFilters: state => {
      state.therapyType = null;
      state.areaOfFocus = [];
      state.language = null;
      state.therapistGender = null;
      state.sessionType = null;
      state.state = null;
      state.city = null;
      state.paymentMethod = null;
      state.carrier = null;
    },
  },
});

export const selectAppliedAppointmentFilters = (state: {
  appointmentFilters: AppointmentFiltersState;
}) => state.appointmentFilters;

export const { setFilters, clearAppointmentFilters } = appointmentFilters.actions;

export default appointmentFilters.reducer;
