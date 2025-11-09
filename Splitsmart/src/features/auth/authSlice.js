// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  token: null,
  user: null,
  isLoading: true, // Used to check if we've finished checking for token on app start
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      AsyncStorage.setItem('userToken', token); // Persist token
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem('userToken'); // Clear token
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;

export default authSlice.reducer;

// Selector for authenticated status
export const selectIsAuthenticated = (state) => state.auth.token !== null;
// Selector for user info
export const selectCurrentUser = (state) => state.auth.user;
// Selector for loading state (e.g., during initial token check)
export const selectAuthLoading = (state) => state.auth.isLoading;