import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser } from '@/services/api';

// ✅ Proper createAsyncThunk
export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await loginUser(credentials);
      return { token: data.token, role: data.user?.role || 'User' };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('userRole') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    },
  },
  setAuth: (state, action) => {
    const { token, role } = action.payload;
    state.token = token;
    state.role = role || 'User';
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role || 'User');
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('userRole', action.payload.role);
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout , setAuth} = authSlice.actions;
export default authSlice.reducer;
