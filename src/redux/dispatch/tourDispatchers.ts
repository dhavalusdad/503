import { endTour, setTourActive, setTourId, setTourStep, startTour } from '@/redux/ducks/tour';
import { store } from '@/redux/store';

export const dispatchSetTourActive = (isActive: boolean) => {
  store.dispatch(setTourActive(isActive));
};

export const dispatchSetTourStep = (step: number) => {
  store.dispatch(setTourStep(step));
};

export const dispatchSetTourId = (tourId: string | undefined) => {
  store.dispatch(setTourId(tourId));
};

export const dispatchStartTour = (data?: { tourId?: string; startStep?: number }) => {
  store.dispatch(
    startTour({
      tourId: data?.tourId,
      startStep: data?.startStep || 0,
    })
  );
};

export const dispatchEndTour = () => {
  store.dispatch(endTour());
};
