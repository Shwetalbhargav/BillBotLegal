// src/store/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsers, getMe, updateMe } from '@/services/api';


export const getMeThunk = createAsyncThunk('users/getMe', async (_, { rejectWithValue }) => {
try {
const { data } = await getMe();
return data.user;
} catch (err) {
return rejectWithValue(err.response?.data?.error || 'Failed to load profile');
}
});

export const updateMeThunk = createAsyncThunk('users/updateMe', async (payload, { rejectWithValue }) => {
try {
const { data } = await updateMe(payload);
return data.user; // updated user
} catch (err) {
return rejectWithValue(err.response?.data?.error || 'Failed to update profile');
}
});


export const fetchUsersThunk = createAsyncThunk('users/fetch', async (params, { rejectWithValue }) => {
try {
const { data } = await fetchUsers(params); // { items, total, page, limit }
return data;
} catch (err) {
return rejectWithValue(err.response?.data?.error || 'Failed to fetch users');
}
});

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
updating: false,
},
reducers: {},
extraReducers: (builder) => {
builder
      .addCase(getMeThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(getMeThunk.fulfilled, (s, a) => { s.loading = false; s.me = a.payload; })
      .addCase(getMeThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateMeThunk.pending, (s) => { s.updating = true; s.error = null; })
      .addCase(updateMeThunk.fulfilled, (s, a) => { s.updating = false; s.me = a.payload; })
      .addCase(updateMeThunk.rejected, (s, a) => { s.updating = false; s.error = a.payload; })
      .addCase(fetchUsersThunk.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUsersThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.list = a.payload.items || [];
      s.total = a.payload.total || 0;
      s.page = a.payload.page || 1;
      s.limit = a.payload.limit || 20;
      })
      .addCase(fetchUsersThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
      },
});

export const selectUsers = (state) => state.users.list;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectMe = (state) => state.users.me;
export const selectIsUpdatingMe = (state) => state.users.updating;


export default usersSlice.reducer;