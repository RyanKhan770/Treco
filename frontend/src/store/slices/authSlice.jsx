import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await authAPI.login({ email, password });
      await AsyncStorage.setItem('token', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await authAPI.register(userData);
      await AsyncStorage.setItem('token', res.data.token);
      if (res.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return rejectWithValue('No token');
      const res = await authAPI.getMe();
      return { user: res.data, token };
    } catch (err) {
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
      return rejectWithValue('Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    role: 'user',
    loading: false,
    error: null,
    isAuthenticated: false,
    isSessionExpired: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = 'user';
      state.isAuthenticated = false;
      state.isSessionExpired = false;
      state.error = null;
      AsyncStorage.multiRemove(['token', 'refreshToken']);
    },
    clearError: (state) => {
      state.error = null;
    },
    hydrate: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user?.role || 'user';
      state.isAuthenticated = true;
      state.loading = false;
      state.isSessionExpired = false;
    },
    // Triggered by the axios interceptor when the refresh token is also expired.
    // Shows the SessionExpiredModal without clearing the navigation stack.
    triggerSessionExpired: (state) => {
      state.isSessionExpired = true;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    clearSessionExpired: (state) => {
      state.isSessionExpired = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || 'user';
        state.isAuthenticated = true;
        state.isSessionExpired = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || 'user';
        state.isAuthenticated = true;
        state.isSessionExpired = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load user on app start (or background role refresh).
      // Only show the full-screen loading spinner during the initial boot;
      // when already authenticated, update silently so navigation is undisturbed.
      .addCase(loadUser.pending, (state) => {
        if (!state.isAuthenticated) state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || 'user';
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, hydrate, triggerSessionExpired, clearSessionExpired } =
  authSlice.actions;
export default authSlice.reducer;
