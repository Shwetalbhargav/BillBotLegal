// src/store/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listUsers,
  getMe,
  updateUser,
  getMyScopesApi,
  getUserById,
  getUserProfileApi,
  upsertUserProfileApi,
  getUserDefaultRateApi,
} from '@/services/api';

// ========= THUNKS =========

// Get currently logged-in user
export const getMeThunk = createAsyncThunk(
  'users/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMe();
      return data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load profile'
      );
    }
  }
);

// Update current user (self)
export const updateMeThunk = createAsyncThunk(
  'users/updateMe',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const meId = getState()?.users?.me?.id || getState()?.users?.me?._id;
      if (!meId) throw new Error('Missing current user id');
      const { data } = await updateUser(meId, payload);
      return data.user || data; // updated user
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
          err.message ||
          'Failed to update profile'
      );
    }
  }
);

// Admin: list users with filters/pagination
export const fetchUsersThunk = createAsyncThunk(
  'users/fetch',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await listUsers(params); // { items, total, page, limit }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to fetch users'
      );
    }
  }
);

// Get my scopes: { firmId, role, isAdmin }
export const getMyScopesThunk = createAsyncThunk(
  'users/getMyScopes',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getMyScopesApi();
      return data; // { firmId, role, isAdmin }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load scopes'
      );
    }
  }
);

// Admin: fetch single user by id
export const fetchUserByIdThunk = createAsyncThunk(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getUserById(id);
      return data.user || data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load user'
      );
    }
  }
);

// Admin: fetch role-specific profile + default rate for a user
export const fetchUserProfileThunk = createAsyncThunk(
  'users/fetchProfile',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getUserProfileApi(id);
      // data: { success, user, profile, defaultRate }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load user profile'
      );
    }
  }
);

// Admin: upsert role-specific profile
export const upsertUserProfileThunk = createAsyncThunk(
  'users/upsertProfile',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await upsertUserProfileApi(id, payload);
      // data: { success, profile, defaultRate }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to save user profile'
      );
    }
  }
);

// Admin: fetch only default rate
export const fetchUserDefaultRateThunk = createAsyncThunk(
  'users/fetchDefaultRate',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getUserDefaultRateApi(id);
      // data: { userId, defaultRate }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to load default rate'
      );
    }
  }
);

// ========= SLICE =========

const initialState = {
  me: null,
  list: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  error: null,
  updating: false,

  // new stuff:
  scopes: null,      // { firmId, role, isAdmin }
  current: null,     // single user (for admin view/edit)
  profile: null,     // role-specific profile
  defaultRate: null, // last loaded defaultRate
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- me ----
      .addCase(getMeThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getMeThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.me = a.payload;
      })
      .addCase(getMeThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ---- update me ----
      .addCase(updateMeThunk.pending, (s) => {
        s.updating = true;
        s.error = null;
      })
      .addCase(updateMeThunk.fulfilled, (s, a) => {
        s.updating = false;
        s.me = a.payload;
      })
      .addCase(updateMeThunk.rejected, (s, a) => {
        s.updating = false;
        s.error = a.payload;
      })

      // ---- list users ----
      .addCase(fetchUsersThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.items || [];
        s.total = a.payload.total || 0;
        s.page = a.payload.page || 1;
        s.limit = a.payload.limit || 20;
      })
      .addCase(fetchUsersThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ---- my scopes ----
      .addCase(getMyScopesThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getMyScopesThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.scopes = a.payload;
      })
      .addCase(getMyScopesThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ---- admin: single user ----
      .addCase(fetchUserByIdThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchUserByIdThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchUserByIdThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ---- admin: user profile ----
      .addCase(fetchUserProfileThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchUserProfileThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.profile = a.payload.profile || null;
        s.defaultRate =
          a.payload.defaultRate !== undefined
            ? a.payload.defaultRate
            : s.defaultRate;
        if (a.payload.user) {
          s.current = a.payload.user;
        }
      })
      .addCase(fetchUserProfileThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ---- admin: upsert profile ----
      .addCase(upsertUserProfileThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(upsertUserProfileThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.profile = a.payload.profile || null;
        s.defaultRate =
          a.payload.defaultRate !== undefined
            ? a.payload.defaultRate
            : s.defaultRate;
      })
      .addCase(upsertUserProfileThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ---- admin: default rate only ----
      .addCase(fetchUserDefaultRateThunk.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchUserDefaultRateThunk.fulfilled, (s, a) => {
        s.loading = false;
        s.defaultRate =
          a.payload.defaultRate !== undefined
            ? a.payload.defaultRate
            : s.defaultRate;
      })
      .addCase(fetchUserDefaultRateThunk.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

// ========= SELECTORS =========

export const selectUsers = (state) => state.users.list;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectMe = (state) => state.users.me;
export const selectIsUpdatingMe = (state) => state.users.updating;

export const selectUserScopes = (state) => state.users.scopes;
export const selectCurrentUser = (state) => state.users.current;
export const selectCurrentUserProfile = (state) => state.users.profile;
export const selectCurrentUserDefaultRate = (state) => state.users.defaultRate;

export default usersSlice.reducer;
