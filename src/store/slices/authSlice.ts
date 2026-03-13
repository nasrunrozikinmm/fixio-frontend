import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { authApi } from '../api/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // true by default — akan jadi false setelah /auth/me resolve
  sessionExpired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setSessionExpired(state, action: PayloadAction<boolean>) {
      state.sessionExpired = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Auto-sync auth state dari RTK Query getMe
    builder
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.updateProfile.matchFulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { setUser, clearAuth, setSessionExpired } = authSlice.actions;
export default authSlice.reducer;
