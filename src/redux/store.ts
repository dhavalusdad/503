import rootReducer from './root.reducer';
import { configureStore } from '@reduxjs/toolkit';
import type { Middleware } from 'redux';
import { logger } from 'redux-logger';
import { persistStore } from 'redux-persist';

const Middlewares: Middleware[] = [];

if (process.env.NODE_ENV === 'development') {
  Middlewares.push(logger);
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    }).concat(Middlewares)
});

export const persister = persistStore(store);
const exportStore = { store, persister };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default exportStore;
