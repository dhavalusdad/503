import { configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from './root.reducer';

import type { Middleware } from 'redux';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [],
  blacklist: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const Middlewares: Middleware[] = [];

if (import.meta.env.MODE === 'development') {
  Middlewares.push(logger);
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(Middlewares),
});

export const persister = persistStore(store);
const exportStore = { store, persister };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default exportStore;
