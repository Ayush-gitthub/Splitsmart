// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice'; // We'll create this next
import { splitSmartApi } from '../api/splitSmartApi'; // We'll create this next

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [splitSmartApi.reducerPath]: splitSmartApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of RTK Query.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(splitSmartApi.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - RTK Query requires store and a callback for this feature
setupListeners(store.dispatch);