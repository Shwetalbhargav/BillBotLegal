// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, getMe, loginAdmin, getAdminMe } from '@/services/api';

const COOKIE_SESSION_TOKEN = 'cookie-session';

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await loginUser(credentials);
      return { token: data.token || COOKIE_SESSION_TOKEN, user: data.user };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    }
  }
);

export const bootstrapSessionThunk = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMe({ skipAuthRedirect: true });
      return { token: COOKIE_SESSION_TOKEN, user: data.user };
    } catch (e) {
      // attempt refresh if available
      return rejectWithValue(e.response?.data?.error || e.response?.data?.message || 'Session bootstrap failed');
    }
  }
);

export const adminLoginThunk = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await loginAdmin(credentials);
      return { user: data.user || data.admin, token: data.token || COOKIE_SESSION_TOKEN };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    }
  }
);

const initialToken =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const initialRole =
  typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    user: null, // full user doc
    role: initialRole, // convenience
    loading: false,
    error: null,
  },
  reducers: {
    setAuth: (state, action) => {
      const { token, user } = action.payload || {};
      state.token = token || null;
      state.user = user || null;
      state.role = user?.role || null;
      if (token) localStorage.setItem('token', token);
      if (user?.role) localStorage.setItem('userRole', user.role);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = a.payload.user;
        s.role = a.payload.user?.role || null;
        localStorage.setItem('token', a.payload.token);
        if (s.role) localStorage.setItem('userRole', s.role);
      })
      .addCase(loginUserThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(bootstrapSessionThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(bootstrapSessionThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        localStorage.setItem('token', a.payload.token);
        s.user = a.payload.user;
        s.role = a.payload.user?.role || null;
        if (s.role) localStorage.setItem('userRole', s.role);
      })
      .addCase(bootstrapSessionThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const loadMeThunk = createAsyncThunk(
  'auth/loadMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getAdminMe(); // { admin }
      return data.admin;
    } catch (err) {
      return rejectWithValue('Failed to load profile');
    }
  }
);

// ⬅️ This is the key fix: export setAuth as well.
export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
