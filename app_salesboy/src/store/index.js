import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import authReducer from '../features/auth/slice';
import visitReducer from '../features/visits/slice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    visits: visitReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware)
});

export default store;
