// src/store/rateCardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  listRateCardsApi,
  createRateCardApi,
  updateRateCardApi,
  deleteRateCardApi,
  resolveRateApi,
} from '../services/api';

const initialState = {
  items: [],
  loading: false,
  error: null,
  resolvedRate: null,
};

// ---- Thunks ----
// ---- Thunks ----
export const fetchRateCards = createAsyncThunk(
  'rateCards/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await listRateCardsApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load rate cards'
      );
    }
  }
);

export const createRateCardThunk = createAsyncThunk(
  'rateCards/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createRateCardApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to create rate card'
      );
    }
  }
);

export const updateRateCardThunk = createAsyncThunk(
  'rateCards/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateRateCardApi(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to update rate card'
      );
    }
  }
);

export const deleteRateCardThunk = createAsyncThunk(
  'rateCards/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteRateCardApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to delete rate card'
      );
    }
  }
);

export const resolveRateThunk = createAsyncThunk(
  'rateCards/resolve',
  async (params, { rejectWithValue }) => {
    try {
      const res = await resolveRateApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to resolve rate'
      );
    }
  }
);


// ---- Slice ----
const rateCardSlice = createSlice({
  name: 'rateCards',
  initialState,
  reducers: {
    clearRateCardError(state) {
      state.error = null;
    },
    clearResolvedRate(state) {
      state.resolvedRate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchRateCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRateCards.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRateCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // create
      .addCase(createRateCardThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })

      // update
      .addCase(updateRateCardThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })

      // delete
      .addCase(deleteRateCardThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })

      // resolve
      .addCase(resolveRateThunk.pending, (state) => {
        state.loading = true;
        state.resolvedRate = null;
      })
      .addCase(resolveRateThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.resolvedRate = action.payload;
      })
      .addCase(resolveRateThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRateCardError, clearResolvedRate } = rateCardSlice.actions;
export default rateCardSlice.reducer;
