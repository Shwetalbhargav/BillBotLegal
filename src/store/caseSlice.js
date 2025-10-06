import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCases as apiGetCases,
  createCase as apiCreateCase,
  updateCase as apiUpdateCase,
  deleteCase as apiDeleteCase,
} from '@/services/api';

export const fetchCases = createAsyncThunk('cases/fetch', async () => {
  const { data } = await apiGetCases();
  return data;
});

export const createCase = createAsyncThunk('cases/create', async (caseData) => {
  const { data } = await apiCreateCase(caseData);
  return data;
});

export const editCase = createAsyncThunk('cases/update', async ({ id, caseData }) => {
  const { data } = await apiUpdateCase(id, caseData);
  return data;
});

export const removeCase = createAsyncThunk('cases/delete', async (id) => {
  await apiDeleteCase(id);
  return id;
});

const caseSlice = createSlice({
  name: 'cases',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to fetch cases';
      })
      .addCase(createCase.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(editCase.fulfilled, (state, action) => {
        const idx = state.list.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(removeCase.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c._id !== action.payload);
      });
  },
});

export default caseSlice.reducer;
