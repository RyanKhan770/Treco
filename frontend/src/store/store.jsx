import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import trailsReducer from './slices/trailsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    trails: trailsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
