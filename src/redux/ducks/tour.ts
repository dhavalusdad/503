import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

interface TourState {
  isActive: boolean;
  currentStep?: number;
  tourId?: string;
}

const initialState: TourState = {
  isActive: false,
  currentStep: 0,
  tourId: undefined,
};

const tour = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    setTourActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
      if (!action.payload) {
        // Reset step when tour is deactivated
        state.currentStep = 0;
      }
    },
    setTourStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setTourId: (state, action: PayloadAction<string | undefined>) => {
      state.tourId = action.payload;
    },
    startTour: (state, action: PayloadAction<{ tourId?: string; startStep?: number }>) => {
      state.isActive = true;
      state.tourId = action.payload.tourId;
      state.currentStep = action.payload.startStep || 0;
    },
    endTour: state => {
      state.isActive = false;
      state.currentStep = 0;
      state.tourId = undefined;
    },
  },
});

export const selectTour = (state: { tour: TourState }) => state.tour;
export const selectIsTourActive = (state: { tour: TourState }) => state.tour.isActive;
export const selectTourStep = (state: { tour: TourState }) => state.tour.currentStep;
export const selectTourId = (state: { tour: TourState }) => state.tour.tourId;

export const { setTourActive, setTourStep, setTourId, startTour, endTour } = tour.actions;
export default tour.reducer;
