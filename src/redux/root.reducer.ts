import { combineReducers } from 'redux';
import { type WebStorage, persistReducer } from 'redux-persist';
import userReducer from './ducks/user';
const createNoopStorage: () => WebStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem() {
      return Promise.resolve();
    },
    removeItem() {
      return Promise.resolve();
    }
  };
};

const storage: WebStorage = createNoopStorage();

const persistConfig = {
  key: 'entity',
  storage: storage
};

const rootReducer = combineReducers({
  user: userReducer,
});

export default persistReducer(persistConfig, rootReducer);
