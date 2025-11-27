// src/store/timeEntrySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listTimeEntriesApi,
  createTimeEntryApi,
  updateTimeEntryApi,
  submitTimeEntryApi,
  approveTimeEntryApi,
  rejectTimeEntryApi,
  createTimeEntryFromActivityApi,
} from '../services/api';

// Shape from backend examples:
// GET /api/time-entries?userId=&status=&from=&to=
const initialState = {
  items: [],
  loading: false,
  error: null,
};
export const fetchTimeEntries = createAsyncThunk(
  'timeEntries/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await listTimeEntriesApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load time entries'
      );
    }
  }
);


export const createTimeEntryThunk = createAsyncThunk(
  'timeEntries/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createTimeEntryApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create time entry'
      );
    }
  }
);


export const updateTimeEntryThunk = createAsyncThunk(
  'timeEntries/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateTimeEntryApi(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update time entry'
      );
    }
  }
);


export const deleteTimeEntryThunk = createAsyncThunk(
  'timeEntries/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteTimeEntry(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to delete time entry'
      );
    }
  }
);
export const createTimeEntryFromActivityThunk = createAsyncThunk(
  'timeEntries/createFromActivity',
  async ({ activityId, data = {} }, { rejectWithValue }) => {
    try {
      const res = await createTimeEntryFromActivityApi(activityId, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create from activity'
      );
    }
  }
);
// ----- submit / approve / reject -----
export const submitTimeEntryThunk = createAsyncThunk(
  'timeEntries/submit',
  async (id, { rejectWithValue }) => {
    try {
      const res = await submitTimeEntryApi(id);
      return res.data; // expecting updated time entry
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to submit time entry'
      );
    }
  }
);

export const approveTimeEntryThunk = createAsyncThunk(
  'timeEntries/approve',
  async (id, { rejectWithValue }) => {
    try {
      const res = await approveTimeEntryApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to approve time entry'
      );
    }
  }
);

export const rejectTimeEntryThunk = createAsyncThunk(
  'timeEntries/reject',
  async (id, { rejectWithValue }) => {
    try {
      const res = await rejectTimeEntryApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to reject time entry'
      );
    }
  }
);

const timeEntrySlice = createSlice({
  name: 'timeEntries',
  initialState,
  reducers: {
    clearTimeEntryError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // list
    builder
      .addCase(fetchTimeEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchTimeEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // create
    builder
      .addCase(createTimeEntryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimeEntryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTimeEntryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // update
    builder
      .addCase(updateTimeEntryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimeEntryThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateTimeEntryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // delete
    builder
      .addCase(deleteTimeEntryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimeEntryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTimeEntryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // submit / approve / reject -> just replace the entry returned
    const replaceEntry = (state, updated) => {
      if (!updated || !updated.id) return;
      const idx = state.items.findIndex((t) => t.id === updated.id);
      if (idx !== -1) state.items[idx] = updated;
    };

    builder
      .addCase(submitTimeEntryThunk.fulfilled, (state, action) => {
        replaceEntry(state, action.payload);
      })
      .addCase(approveTimeEntryThunk.fulfilled, (state, action) => {
        replaceEntry(state, action.payload);
      })
      .addCase(rejectTimeEntryThunk.fulfilled, (state, action) => {
        replaceEntry(state, action.payload);
      });
  },
});

export const { clearTimeEntryError } = timeEntrySlice.actions;
export default timeEntrySlice.reducer;
