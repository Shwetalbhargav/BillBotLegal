// src/features/users/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsers, getMe } from '@/services/api';

// Load current user (useful for bootstrapping UI by role)
export const getMeThunk = createAsyncThunk(
  'users/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMe();
      return data.user; // { _id, name, email, role, ... }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to load profile');
    }
  }
);

// Fetch users for dropdowns/tables with optional role filter
export const fetchUsersThunk = createAsyncThunk(
  'users/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await fetchUsers(params); // { items, total, page, limit }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch users');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    me: null,
    list: [],
    total: 0,
    page: 1,
    limit: 20,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getMe
      .addCase(getMeThunk.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.loading = false; state.me = action.payload;
      })
      .addCase(getMeThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      // fetchUsers
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 20;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const selectUsers = (state) => state.users.list;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectMe = (state) => state.users.me;

export default usersSlice.reducer;
